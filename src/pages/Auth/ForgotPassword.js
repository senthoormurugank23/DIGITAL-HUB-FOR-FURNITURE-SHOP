import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "../../components/Layout/Layout";
import "../../styles/ForgetPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    try {
      const response = await axios.post("/api/v1/auth/send-otp", { email });
      toast.success(response.data.message);

      // Redirect to OTP Verification page
      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      toast.error("Failed to send OTP");
    }
  };

  return (
    <Layout title={"Forgot Password"}>
      <div className="auth-container">
        <div className="auth-box">
          <h2>Forgot Password</h2>
          <input
            type="email"
            className="auth-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="auth-button" onClick={handleSendOTP}>
            Send OTP
          </button>
          <a href="/login" className="auth-link">
            Back to Login
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
