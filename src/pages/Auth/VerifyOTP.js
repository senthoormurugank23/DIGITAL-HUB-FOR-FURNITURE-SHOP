import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "../../components/Layout/Layout";
import "../../styles/ForgetPassword.css";

const VerifyOTP = () => {
  const [otp, setOTP] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // Get email from navigation state

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post("/api/v1/auth/verify-otp", {
        email,
        otp,
      });
      toast.success(response.data.message);

      // Redirect to Reset Password page
      navigate("/reset-password", { state: { email } });
    } catch (error) {
      toast.error("Invalid OTP");
    }
  };

  return (
    <Layout title={"Verify OTP"}>
      <div className="auth-container">
        <div className="auth-box">
          <h2>Verify OTP</h2>
          <input
            type="text"
            className="auth-input"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOTP(e.target.value)}
          />
          <button className="auth-button" onClick={handleVerifyOTP}>
            Verify OTP
          </button>
          <a href="/forgot-password" className="auth-link">
            Resend OTP
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyOTP;
