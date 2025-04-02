import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { GiWoodenChair } from "react-icons/gi";
import { FaShoppingCart } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import SearchInput from "../Form/SearchInput";
import useCategory from "../../hooks/useCategory";
import { Badge } from "antd";
import "../../styles/Header.css";

const Header = () => {
  const [auth, setAuth] = useAuth();
  const { cart, setCart, cartQuantity, setCartQuantity } = useCart();
  const categories = useCategory();
  const [isSticky, setIsSticky] = useState(false);

  // Handle scroll to add sticky class
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    setAuth({ ...auth, user: null, token: "" });
    localStorage.removeItem("auth");
    setCart([]);
    setCartQuantity(0);
    toast.success("Logout Successfully 🙏");
  };

  return (
    <nav
      className={`navbar navbar-expand-sm gradient-background ${
        isSticky ? "sticky-nav" : ""
      }`}
    >
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarTogglerDemo01"
          aria-controls="navbarTogglerDemo01"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
          <Link to="/" className="navbar-brand d-flex align-items-center me-3">
            <GiWoodenChair className="logo me-2" />
            <span className="fw-bold">SAP Furnitures</span>
          </Link>

          <div
            className="d-flex justify-content-center flex-grow-1 mx-3"
            style={{ maxWidth: "600px" }}
          >
            <SearchInput />
          </div>

          {/* Left-Aligned Navbar Items */}
          <ul className="navbar-nav nav-left">
            <li className="nav-item me-1">
              <NavLink to="/home" className="nav-link">
                Home
              </NavLink>
            </li>

            <li className="nav-item me-1">
              <NavLink to="/" className="nav-link">
                Collections
              </NavLink>
            </li>

            {!auth.user ? (
              <>
                <li className="nav-item me-1">
                  <NavLink to="/register" className="nav-link">
                    Register
                  </NavLink>
                </li>
                <li className="nav-item me-1">
                  <NavLink to="/login" className="nav-link">
                    Login
                  </NavLink>
                </li>
              </>
            ) : (
              <li className="nav-item dropdown me-1">
                <NavLink
                  className="nav-link dropdown-toggle"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  {auth?.user?.name}
                </NavLink>
                <ul className="dropdown-menu">
                  <li>
                    <NavLink
                      className="dropdown-item"
                      to={`/dashboard/${
                        auth?.user?.role === 1 ? "admin" : "user"
                      }`}
                    >
                      Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      onClick={handleLogout}
                      to="/login"
                      className="dropdown-item"
                    >
                      Logout
                    </NavLink>
                  </li>
                </ul>
              </li>
            )}

            {auth?.user?.role !== 1 && (
              <li className="nav-item">
                <Badge count={cartQuantity} showZero>
                  <NavLink to="/cart" className="nav-link">
                    <FaShoppingCart />
                  </NavLink>
                </Badge>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
