import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "../../components/Layout/Layout";
import "../../styles/ForgetPassword.css";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [isValidPassword, setIsValidPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // Get email from navigation state

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);

    // Validate password and update state
    const isValid = passwordRegex.test(password);
    setIsValidPassword(isValid);

    console.log("Password Valid:", isValid); // Debugging Log
  };

  const handleResetPassword = async () => {
    if (!isValidPassword) {
      toast.error(
        "Password must contain 1 uppercase, 1 number, 1 special character, and be at least 6 characters long"
      );
      return;
    }

    try {
      const response = await axios.post("/api/v1/auth/reset-password", {
        email,
        newPassword,
      });

      toast.success(response.data.message);
      navigate("/login"); // Redirect to login page
    } catch (error) {
      toast.error("Failed to reset password");
      console.error(error); // Debugging log
    }
  };

  return (
    <Layout title={"Reset Password"}>
      <div className="auth-container">
        <div className="auth-box">
          <h2>Reset Password</h2>
          <input
            type="password"
            className="auth-input"
            placeholder="New password"
            value={newPassword}
            onChange={handlePasswordChange}
          />
          {newPassword && !isValidPassword && (
            <p className="error-message">
              ⚠️ Password must contain 1 uppercase letter, 1 number, 1 special
              character, and be at least 6 characters long.
            </p>
          )}
          <button
            className="auth-button"
            onClick={handleResetPassword}
            disabled={!isValidPassword}
          >
            Reset Password
          </button>
          <a href="/login" className="auth-link">
            Back to Login
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
