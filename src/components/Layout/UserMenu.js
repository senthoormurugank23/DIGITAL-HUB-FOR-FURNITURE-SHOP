import React from "react";
import { NavLink } from "react-router-dom";
import { BiSolidUserDetail } from "react-icons/bi";
import { LuPackageSearch } from "react-icons/lu";
import { MdOutlineManageAccounts } from "react-icons/md";
import "../../styles/UserMenu.css";

const UserMenu = () => {
  return (
    <nav className="user-navbar">
      <h4 className="user-navbar-title">User Dashboard</h4>
      <div className="user-navbar-links">
        <NavLink to="/dashboard/user/user-details" className="user-navbar-link">
          <BiSolidUserDetail size={20} />
          <span>User Details</span>
        </NavLink>
        <NavLink to="/dashboard/user/profile" className="user-navbar-link">
          <MdOutlineManageAccounts size={20} />
          <span>Update Profile</span>
        </NavLink>
        <NavLink to="/dashboard/user/orders" className="user-navbar-link">
          <LuPackageSearch size={20} />
          <span>Orders</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default UserMenu;
