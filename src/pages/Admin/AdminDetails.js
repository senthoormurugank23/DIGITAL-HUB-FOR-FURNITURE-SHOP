import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import AdminMenu from "../../components/Layout/AdminMenu";
import axios from "axios";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import "../../styles/AdminDetails.css"; // Import the CSS file

const AdminDetails = () => {
  const [auth] = useAuth();

  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersRes = await axios.get("/api/v1/order/all-orders");
      if (ordersRes.data.success) {
        const orders = ordersRes.data.orders;

        // Filter out orders with payment status "Pending" or status "Cancelled"
        const filteredOrders = orders.filter(
          (order) =>
            order.paymentDetails.status !== "Pending" &&
            order.status !== "Cancelled"
        );

        // Set total orders excluding pending and cancelled orders
        setTotalOrders(filteredOrders.length);

        // Calculate Total Revenue from Orders excluding cancelled and pending orders
        const revenue = filteredOrders.reduce(
          (sum, order) => sum + order.totalPrice,
          0
        );
        setTotalRevenue(revenue);
      } else {
        toast.error("Failed to fetch orders");
      }

      // Fetch products
      const productsRes = await axios.get("/api/v1/product/get-product");
      if (productsRes.data.success) {
        setTotalProducts(productsRes.data.products.length);
      } else {
        toast.error("Failed to fetch products");
      }

      // Fetch users
      const usersRes = await axios.get("/api/users");
      setTotalUsers(usersRes.data.length);
    } catch (error) {
      console.error("Dashboard Data Fetch Error", error);
      toast.error("Failed to fetch dashboard data");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <Layout>
      <AdminMenu />
      <div className="container mt-4">
        <h1 className="mb-4 text-center">Admin Dashboard</h1>

        {/* Dashboard Stats */}
        <div className="row g-4">
          <DashboardCard
            title="Total Orders"
            value={totalOrders}
            color="bg-primary"
            icon="📦"
          />
          <DashboardCard
            title="Total Products"
            value={totalProducts}
            color="bg-success"
            icon="🛒"
          />
          <DashboardCard
            title="Total Users"
            value={totalUsers}
            color="bg-info"
            icon="👥"
          />
          <DashboardCard
            title="Total Revenue"
            value={`₹${totalRevenue}`}
            color="bg-warning"
            icon="💰"
          />
        </div>

        {/* Admin Details Section */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm border-0 rounded p-4">
              <h3 className="text-center mb-4 text-dark">Admin Details</h3>
              <div className="table-responsive">
                <table className="table table-hover text-center shadow-sm">
                  <tbody>
                    <tr>
                      <td>
                        <strong>Name:</strong>
                      </td>
                      <td>{auth?.user?.name}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Email:</strong>
                      </td>
                      <td>{auth?.user?.email}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Role:</strong>
                      </td>
                      <td>Admin</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Reusable Card Component with Hover Effects
const DashboardCard = ({ title, value, color, icon }) => (
  <div className="col-md-3 col-sm-6 mb-4">
    <div
      className={`card text-white ${color} o-hidden h-100 shadow-sm hover-effect`}
    >
      <div className="card-body text-center">
        <div className="card-font-size">
          <div className="icon-large">{icon}</div>
          <h5 className="mt-3">{title}</h5>
          <b>{value}</b>
        </div>
      </div>
    </div>
  </div>
);

export default AdminDetails;
