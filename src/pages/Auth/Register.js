import React, { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import Layout from "../../components/Layout/Layout";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import RegisterImg from "../../Assets/r1.jpg";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.length < 5) {
      toast.error("Username must be at least 5 characters long");
      return;
    }
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 6 characters long, contain 1 uppercase letter, 1 number, and 1 special character"
      );
      return;
    }
    try {
      const res = await axios.post("/api/v1/auth/register", {
        name,
        email,
        password,
      });
      if (res && res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message;
        toast.error(errorMessage);
      } else {
        toast.error("Something went wrong during registration");
      }
    }
  };

  return (
    <Layout title={"Register - User"}>
      <section className="vh-100 r">
        <div className="container-fluid h-custom">
          <div className="row d-flex justify-content-center align-items-center h-100">
            {/* Left Side - Form */}
            <div className="col-md-8 col-lg-5 col-xl-4 offset-xl-1">
              <form onSubmit={handleSubmit}>
                <h3 className="login-text text-center mb-5">
                  Create New Account
                </h3>
                <div className="form-outline mb-4">
                  <input
                    type="text"
                    className="form-control form-control-lg form"
                    placeholder="Enter Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-outline mb-4">
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-outline mb-4 position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control form-control-lg"
                    placeholder="Create a Password"
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
                <div className="text-center mt-4 pt-2">
                  <button type="submit" className=" button-55  mb-2">
                    Register
                  </button>
                  <p className="small fw-bold mt-2 pt-1 mb-0">
                    Already have an account?{" "}
                    <span
                      className="link-danger"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate("/login")}
                    >
                      Sign In
                    </span>
                  </p>
                </div>
              </form>
            </div>
            <div className="col-md-9 col-lg-6 col-xl-5 d-none d-lg-block mx-10">
              <img
                src={RegisterImg}
                className="img-fluid rounded-5"
                alt="Register"
                style={{
                  maxHeight: "500px",
                  width: "100%",
                  objectFit: "cover",
                  marginLeft: "20px",
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Register;
