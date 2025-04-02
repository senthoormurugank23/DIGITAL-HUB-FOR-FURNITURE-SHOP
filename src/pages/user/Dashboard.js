import React from "react";
import Layout from "../../components/Layout/Layout";
import UserMenu from "../../components/Layout/UserMenu";
import { useAuth } from "../../context/auth";
import UserDetails from "./UserDetails";
import { Routes, Route, Navigate } from "react-router-dom";

const Dashboard = () => {
  const [auth] = useAuth();
  return (
    <Layout title={"Dashboard - User"}>
      <div className="container-fluid p-3">
        <div className="row">
          <div className="col-md-3">
            <UserMenu />
          </div>
          <div className="col-md-9">
            <Routes>
              {/* Redirect to AdminDetails by default */}
              <Route path="/" element={<Navigate to="user-details" />} />
              <Route path="admin-details" element={<UserDetails />} />
            </Routes>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
