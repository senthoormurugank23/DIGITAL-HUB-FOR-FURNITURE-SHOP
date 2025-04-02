import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import AdminDetails from "./AdminDetails";
import CreateCategory from "./CreateCategory";
import CreateProduct from "./CreateProduct";
import Products from "./Products";
import Users from "./Users";
import AdminOrders from "./AdminOrders";
import AdminMenu from "./../../components/Layout/AdminMenu";

const AdminDashboard = () => {
  return (
    <Layout title="Admin Dashboard">
      <div className="admin-dashboard-container">
        <AdminMenu />
        <div className="admin-dashboard-content p-4">
          <Routes>
            <Route path="/" element={<Navigate to="admin-details" />} />
            <Route path="admin-details" element={<AdminDetails />} />
            <Route path="create-category" element={<CreateCategory />} />
            <Route path="create-product" element={<CreateProduct />} />
            <Route path="products" element={<Products />} />
            <Route path="users" element={<Users />} />
            <Route path="admin-orders" element={<AdminOrders />} />
          </Routes>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
