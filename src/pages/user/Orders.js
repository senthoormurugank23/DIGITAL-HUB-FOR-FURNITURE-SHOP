import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import UserMenu from "../../components/Layout/UserMenu";
import axios from "axios";
import moment from "moment";
import { useAuth } from "../../context/auth";
import "../../styles/Orders.css"; // Import the separated CSS file
import toast from "react-hot-toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [auth] = useAuth();
  const [cancelMessage, setCancelMessage] = useState(""); // Add state to track success message

  const handleCancelRequest = async (orderId) => {
    try {
      const { data } = await axios.post("/api/v1/order/cancel-request", {
        orderId,
      });
      if (data.success) {
        toast.success("Cancellation request sent!");
        setCancelMessage("Cancellation request has been successfully sent!"); // Set success message
        fetchOrders(); // Refresh orders after request
      } else {
        toast.error("Failed to send cancellation request");
        setCancelMessage(""); // Clear message if there's an error
      }
    } catch (error) {
      toast.error("Something went wrong with the cancellation request.");
      setCancelMessage(""); // Clear message if there's an error
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/v1/order/user-orders");
      if (data.success) {
        const paidOrders = data.orders.filter(
          (order) => order.paymentDetails?.status === "Paid"
        );
        setOrders(paidOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (auth?.token) fetchOrders();
  }, [auth?.token]);

  return (
    <Layout title="Your Orders">
      <UserMenu />
      <div className="container mt-4">
        <h2 className="text-center mb-4">Your Orders</h2>

        {/* Success message for cancellation request */}
        {cancelMessage && (
          <div className="alert alert-success">{cancelMessage}</div>
        )}

        {orders.length === 0 ? (
          <h4 className="text-center text-muted">No paid orders found</h4>
        ) : (
          <div className="order-list">
            {orders.map((order, index) => (
              <div
                key={order._id}
                className="order-card border rounded p-4 mb-4 shadow-sm bg-white"
              >
                {/* Order Header */}
                <div className="order-header d-flex justify-content-between align-items-center">
                  <h5 className="order-number">Order #{index + 1}</h5>
                  <span className="badge bg-info text-dark">
                    {order.status}
                  </span>
                </div>

                {/* Transaction ID */}
                <p className="mt-2">
                  <strong>Transaction ID:</strong>{" "}
                  {order.paymentDetails?.orderId || "N/A"}
                </p>

                <div className="order-details mt-3">
                  <p>
                    <strong>Order ID:</strong> {order._id}
                  </p>
                  <p>
                    <strong>Total Paid:</strong> ₹
                    {order.totalPrice.toLocaleString()}
                  </p>
                  <p>
                    <strong>Order Date:</strong>{" "}
                    {moment(order.createdAt).format("MMM Do YYYY, h:mm a")}
                  </p>

                  {/* Shipping Address */}
                  <div className="address-box p-2 rounded">
                    <h6 className="mb-2">Shipping Address:</h6>
                    <p className="mb-0">
                      {order.selectedAddress.apartmentNo},{" "}
                      {order.selectedAddress.residencyAddress}
                    </p>
                    <p className="mb-0">
                      {order.selectedAddress.district},{" "}
                      {order.selectedAddress.state} -{" "}
                      {order.selectedAddress.pincode}
                    </p>
                  </div>

                  {/* Status History */}
                  <div className="mt-3">
                    <h6>Status History:</h6>
                    <ul className="timeline">
                      {order.statusHistory?.map((statusEntry, idx) => (
                        <li key={idx} className="timeline-item">
                          <span className="timeline-status">
                            {statusEntry.status}
                          </span>
                          <span className="timeline-date">
                            {moment(statusEntry.date).format(
                              "MMM Do YYYY, h:mm a"
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Disable cancel button if order is delivered */}
                  {order.status !== "Cancelled" &&
                    order.status !== "Delivered" && (
                      <button
                        className="btn btn-danger"
                        onClick={() => handleCancelRequest(order._id)}
                      >
                        Request Cancellation
                      </button>
                    )}
                  {order.status === "Delivered" && (
                    <button className="btn btn-secondary" disabled>
                      Cancellation Not Allowed (Delivered)
                    </button>
                  )}

                  {/* Products Section */}
                  <div className="mt-3">
                    <h6>Products:</h6>
                    <ul className="list-unstyled product-list">
                      {order.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="product-item p-2 border-bottom"
                        >
                          <div className="d-flex justify-content-between">
                            <span>
                              <strong>{item.name}</strong> (x{item.quantity})
                            </span>
                            <span>₹{item.price}</span>
                          </div>

                          {/* Show dimensions & weight if available */}
                          {item.productId?.dimensions && (
                            <div className="small text-muted">
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

                          {item.productId?.weight?.value && (
                            <div className="small text-muted">
                              <strong>Weight:</strong>{" "}
                              {item.productId.weight.value}{" "}
                              {item.productId.weight.unit}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
