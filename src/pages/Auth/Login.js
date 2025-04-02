import React, { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import Layout from "../../components/Layout/Layout";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth";
import loginImage from "../../Assets/loginPage.jpg";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [auth, setAuth] = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/v1/auth/login", {
        email,
        password,
      });

      if (res && res.data.success) {
        toast.success(res.data.message + " 😊");
        setAuth({
          ...auth,
          user: res.data.user,
          token: res.data.token,
        });
        localStorage.setItem("auth", JSON.stringify(res.data));
        navigate(location.state || "/");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message;
        toast.error(errorMessage);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <Layout title={"Login - User"}>
      <section className="vh-100 login">
        <div className="container-fluid h-custom">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-md-9 col-lg-6 col-xl-5">
              <img
                src={loginImage}
                className="img-fluid rounded-5"
                alt="Login"
                height="100"
              />
            </div>
            <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
              <form onSubmit={handleSubmit}>
                <h3 className="login-text text-center mb-5">
                  Sign in to your account
                </h3>
                <div className="form-outline mb-4">
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="Enter a valid email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-outline mb-3 position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control form-control-lg"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="position-absolute top-50 end-0 translate-middle-y me-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <IoEye size={20} />
                    ) : (
                      <IoEyeOff size={20} />
                    )}
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <a
                    href="#!"
                    className="text-body"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot password?
                  </a>
                </div>

                <div className="text-center mt-4 pt-2">
                  <button
                    type="submit"
                    className="button-55 btn-lg mb-2 "
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                  >
                    Login
                  </button>
                  <p className="small fw-bold mt-2 pt-1 mb-0">
                    Don't have an account?{" "}
                    <a
                      href="#!"
                      className="link-danger"
                      onClick={() => navigate("/register")}
                    >
                      Register
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <style>
        {`
          .h-custom {
            height: calc(100% - 73px);
          }
          @media (max-width: 450px) {
            .h-custom {
              height: 100%;
            }
          }
        `}
      </style>
    </Layout>
  );
};

export default Login;
