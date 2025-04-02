import React from "react";
import { NavLink } from "react-router-dom";
import { RiAdminFill } from "react-icons/ri";
import { BiSolidCategory } from "react-icons/bi";
import { FaChair } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { AiOutlineGroup } from "react-icons/ai";
// import "./AdminNavbar.css"; // Ensure CSS is separated for navbar design

const AdminMenu = () => {
  return (
    <nav className="admin-navbar">
      <div className="navbar-logo">Admin Dashboard</div>
      <div className="navbar-links">
        <NavLink to="/dashboard/admin/admin-details" className="navbar-link">
          <RiAdminFill /> Admin Details
        </NavLink>
        <NavLink to="/dashboard/admin/create-category" className="navbar-link">
          <BiSolidCategory /> Create Category
        </NavLink>
        <NavLink to="/dashboard/admin/create-product" className="navbar-link">
          <FaChair /> Create Product
        </NavLink>
        <NavLink to="/dashboard/admin/products" className="navbar-link">
          <MdManageAccounts /> Manage Products
        </NavLink>
        <NavLink to="/dashboard/admin/users" className="navbar-link">
          <FaUser /> Users
        </NavLink>
        <NavLink to="/dashboard/admin/admin-orders" className="navbar-link">
          <AiOutlineGroup /> Orders
        </NavLink>
        <NavLink to="/dashboard/admin/sales" className="navbar-link">
          <AiOutlineGroup /> Sales Report
        </NavLink>
      </div>
    </nav>
  );
};

export default AdminMenu;
