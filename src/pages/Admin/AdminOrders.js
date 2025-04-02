import React, { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout/Layout";
import AdminMenu from "../../components/Layout/AdminMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";
import moment from "moment";
import { Select, Button, Modal, Popconfirm, DatePicker } from "antd";

const { Option } = Select;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [auth] = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Date range filters
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [singleDate, setSingleDate] = useState(null); // State for single date filter

  const statusOrder = [
    "Not Processed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const handleCancelOrder = async (orderId) => {
    try {
      const { data } = await axios.put(
        `/api/v1/order/admin/cancel-order/${orderId}`
      );
      if (data.success) {
        toast.success("Order cancelled and refunded successfully!");
        getOrders(); // Refresh orders
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error cancelling order");
    }
  };

  // Fetch all orders
  const getOrders = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/v1/order/all-orders");
      if (data.success) {
        const sortedOrders = sortOrders(data.orders, "newest");
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      }
    } catch (error) {
      toast.error("Error fetching orders");
    }
  }, []);

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token, getOrders]);

  // Sort orders
  const sortOrders = (ordersList, orderType) => {
    return [...ordersList].sort((a, b) =>
      orderType === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
    const sortedOrders = sortOrders(filteredOrders, value);
    setFilteredOrders(sortedOrders);
  };

  // Handle Status Filter
  const handleStatusFilter = (value) => {
    setSelectedStatus(value);
    if (value) {
      const filtered = orders.filter((order) => order.status === value);
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  };

  // Status change handler
  const handleStatusChange = async (orderId, currentStatus, newStatus) => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(newStatus);

    // Do not allow status change to "Cancelled" directly from the dropdown
    if (newStatus === "Cancelled") {
      toast.error("To cancel the order, please use the 'Cancel Order' button.");
      return;
    }

    // Enforce sequential status updates (excluding "Cancelled")
    if (newStatus !== "Cancelled" && newIndex !== currentIndex + 1) {
      toast.error("Status updates must follow the sequential order.");
      return;
    }

    try {
      const { data } = await axios.put(
        `/api/v1/order/update-status/${orderId}`,
        {
          status: newStatus,
        }
      );
      if (data.success) {
        toast.success("Order status updated successfully!");
        getOrders();
      }
    } catch (error) {
      toast.error("Failed to update order status.");
    }
  };

  // Delete order handler
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const { data } = await axios.delete(`/api/v1/order/delete/${orderId}`);
      if (data.success) {
        toast.success("Order deleted successfully!");
        getOrders();
      } else {
        toast.error("Failed to delete order");
      }
    } catch (error) {
      toast.error("Error deleting order");
    }
  };

  // Filter orders based on date range
  const handleDateFilter = () => {
    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        (!fromDate || orderDate >= fromDate) && (!toDate || orderDate <= toDate)
      );
    });
    setFilteredOrders(filtered);
  };

  // Filter orders based on a single selected date
  const handleSingleDateFilter = () => {
    if (!singleDate) {
      toast.error("Please select a valid date.");
      return;
    }
    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getDate() === singleDate.getDate() &&
        orderDate.getMonth() === singleDate.getMonth() &&
        orderDate.getFullYear() === singleDate.getFullYear()
      );
    });
    setFilteredOrders(filtered);
  };

  // Show order details in modal
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  return (
    <Layout title="Admin - Manage Orders">
      <AdminMenu />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Manage Orders</h2>
          <div className="d-flex gap-3">
            {/* Filter by Status */}
            <Select
              value={selectedStatus}
              onChange={handleStatusFilter}
              placeholder="Filter by Status"
              allowClear
              className="w-50 text-dark"
            >
              {statusOrder.map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>

            {/* Date Range Picker */}
            <DatePicker
              placeholder="From Date"
              onChange={(date) => setFromDate(date ? date.toDate() : null)}
              className="w-25"
            />
            <DatePicker
              placeholder="To Date"
              onChange={(date) => setToDate(date ? date.toDate() : null)}
              className="w-25"
            />
            <Button onClick={handleDateFilter}>Filter by Date Range</Button>

            {/* Single Date Picker */}
            <DatePicker
              placeholder="Select a Date"
              onChange={(date) => setSingleDate(date ? date.toDate() : null)}
              className="w-25"
            />
            <Button onClick={handleSingleDateFilter}>
              Filter by Single Date
            </Button>

            {/* Sort Dropdown */}
            <Select
              value={sortOrder}
              onChange={handleSortChange}
              className="w-50"
            >
              <Option value="newest">Sort by: Newest to Oldest</Option>
              <Option value="oldest">Sort by: Oldest to Newest</Option>
            </Select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <h4 className="text-center text-muted">No orders found</h4>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover shadow-sm rounded">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Order ID</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Order Date</th>
                  <th>Actions</th>
                  <th>Cancel</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o, i) => (
                  <tr key={o._id}>
                    <td>{i + 1}</td>
                    <td>{o._id}</td>
                    <td>{o.paymentDetails?.orderId || "N/A"}</td>
                    <td>
                      <Select
                        value={o.status}
                        onChange={(value) =>
                          handleStatusChange(o._id, o.status, value)
                        }
                        className="w-100"
                        disabled={o.paymentDetails.status !== "Paid"}
                      >
                        {statusOrder.map((status) => (
                          <Option
                            key={status}
                            value={status}
                            disabled={
                              status === "Cancelled" ||
                              o.status === "Cancelled" ||
                              o.status === "Delivered"
                            }
                          >
                            {status}
                          </Option>
                        ))}
                      </Select>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          o.paymentDetails.status === "Paid"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {o.paymentDetails.status}
                      </span>
                    </td>
                    <td>{moment(o.createdAt).format("MMM Do YYYY, h:mm a")}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => handleViewDetails(o)}
                      >
                        View Details
                      </button>
                      <Popconfirm
                        title="Are you sure you want to delete this order?"
                        onConfirm={() => handleDeleteOrder(o._id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button type="primary" danger size="small">
                          Delete
                        </Button>
                      </Popconfirm>
                    </td>
                    <td>
                      {/* Cancel Request button (only for orders with cancellation requests) */}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelOrder(o._id)}
                        disabled={
                          !o.cancelRequested || o.status === "Cancelled"
                        } // Disable if no cancellation request or already cancelled
                      >
                        Cancel Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Order Details Modal */}
        <Modal
          title="Order Details"
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedOrder && (
            <div>
              {/* ✅ PHASE 1: USER DETAILS */}
              <h5 className="fw-bold">User Details</h5>
              <p>
                <strong>Name:</strong> {selectedOrder.userId?.name || "Unknown"}
              </p>
              <p>
                <strong>Email:</strong> {selectedOrder.userId?.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {selectedOrder.userId?.phone || "N/A"}
              </p>
              <p>
                <strong>Transaction ID:</strong>{" "}
                {selectedOrder.paymentDetails?.orderId || "N/A"}
              </p>
              <p>
                <strong>Shipping Address:</strong>{" "}
                {`${selectedOrder.selectedAddress?.apartmentNo || ""}, 
    ${selectedOrder.selectedAddress?.residencyAddress || ""}, 
    ${selectedOrder.selectedAddress?.district || ""}, 
    ${selectedOrder.selectedAddress?.state || ""} - 
    ${selectedOrder.selectedAddress?.pincode || ""}`}
              </p>

              <hr />

              {/* ✅ PHASE 2: ORDER DETAILS */}
              <h5 className="fw-bold">Order Details</h5>
              <p>
                <strong>Order ID:</strong> {selectedOrder._id}
              </p>
              <p>
                <strong>Status:</strong> {selectedOrder.status}
              </p>
              <p>
                <strong>Total Paid:</strong> ₹{selectedOrder.totalPrice}
              </p>
              <p>
                <strong>Order Date:</strong>{" "}
                {moment(selectedOrder.createdAt).format("MMM Do YYYY, h:mm a")}
              </p>

              <h6>Products:</h6>
              <ul>
                {selectedOrder.items.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.name}</strong> (x{item.quantity}) - ₹
                    {item.price}
                    {/* ✅ Display Dimensions if available */}
                    {item.productId?.dimensions && (
                      <div>
                        <strong>Dimensions:</strong>{" "}
                        {item.productId.dimensions.height?.value
                          ? `H: ${item.productId.dimensions.height.value} ${item.productId.dimensions.height.unit}, `
                          : ""}
                        {item.productId.dimensions.width?.value
                          ? `W: ${item.productId.dimensions.width.value} ${item.productId.dimensions.width.unit}, `
                          : ""}
                        {item.productId.dimensions.depth?.value
                          ? `D: ${item.productId.dimensions.depth.value} ${item.productId.dimensions.depth.unit}`
                          : ""}
                      </div>
                    )}
                    {/* ✅ Display Weight if available */}
                    {item.productId?.weight?.value && (
                      <div>
                        <strong>Weight:</strong> {item.productId.weight.value}{" "}
                        {item.productId.weight.unit}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default AdminOrders;
