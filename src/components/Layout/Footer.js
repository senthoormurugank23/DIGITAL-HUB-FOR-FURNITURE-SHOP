import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "rgb(82, 77, 53)",
        width: "100%",
        padding: "20px 0",
      }}
    >
      <div className="container p-3">
        <div className="row">
          {/* About Us */}
          <div className="col-lg-4 col-md-12 mb-2">
            <h6
              className="mb-2"
              style={{ letterSpacing: "1px", color: "rgb(203, 166, 47)" }}
            >
              About Us
            </h6>
            <p
              style={{
                fontSize: "14px",
                marginBottom: "5px",
                color: "rgb(199, 182, 125)",
              }}
            >
              Discover premium quality furniture with elegant designs to
              transform your space.
            </p>
          </div>

          {/* Useful Links */}
          <div className="col-lg-3 col-md-6 mb-2">
            <h6
              className="mb-2"
              style={{ letterSpacing: "1px", color: "rgb(203, 166, 47)" }}
            >
              Useful Links
            </h6>
            <ul className="list-unstyled mb-0" style={{ fontSize: "14px" }}>
              <li className="mb-2">
                <Link
                  to="/about"
                  style={{
                    color: "rgb(199, 182, 125)",
                    textDecoration: "none",
                  }}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  style={{
                    color: "rgb(199, 182, 125)",
                    textDecoration: "none",
                  }}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="col-lg-3 col-md-6 mb-2">
            <h6
              className="mb-2"
              style={{ letterSpacing: "1px", color: "rgb(203, 166, 47)" }}
            >
              Opening Hours
            </h6>
            <table
              className="table"
              style={{
                fontSize: "14px",
                borderRadius: "5px",
              }}
            >
              <tbody>
                <tr>
                  <td
                    className="rounded-3"
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid rgb(0, 0, 0)",
                      backgroundColor: "rgba(179, 168, 109, 0.32)",
                      textAlign: "center",
                    }}
                  >
                    Mon - Fri:
                  </td>
                  <td
                    className="rounded-3"
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid rgb(0, 0, 0)",
                      backgroundColor: "rgb(176, 176, 176)",
                      textAlign: "center",
                    }}
                  >
                    8am - 9pm
                  </td>
                </tr>
                <tr>
                  <td
                    className="rounded-3"
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid rgb(0, 0, 0)",
                      backgroundColor: "rgba(179, 168, 109, 0.32)",
                      textAlign: "center",
                    }}
                  >
                    Sat - Sun:
                  </td>
                  <td
                    className="rounded-3"
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid rgb(0, 0, 0)",
                      backgroundColor: "rgb(176, 176, 176)",
                      textAlign: "center",
                    }}
                  >
                    8am - 1am
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Shop Address */}
          <div className="col-lg-2 col-md-6 mb-2">
            <h6
              className="mb-2"
              style={{ letterSpacing: "1px", color: "rgb(203, 166, 47)" }}
            >
              Shop Address
            </h6>
            <p
              style={{
                fontSize: "14px",
                color: "rgb(199, 182, 125)",
                marginBottom: "0",
              }}
            >
              NSK 1st Cross Street,
              <br />
              Bharathiyar Road,
              <br />
              Madurai – 625011.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div
        className="text-center p-2"
        style={{
          backgroundColor: "rgba(113, 106, 83, 0.78)",
          fontSize: "12px",
        }}
      >
        © {new Date().getFullYear()} Copyright:
        <Link
          to="/"
          style={{
            color: "rgb(203, 203, 203)",
            textDecoration: "none",
            marginLeft: "5px",
          }}
        >
          Senthoor
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
