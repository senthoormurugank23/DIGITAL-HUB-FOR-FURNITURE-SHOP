import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data } = await axios.get(`/api/v1/auth/verify-email/${token}`);
        if (data.success) {
          toast.success(data.message);
          navigate("/login"); // Redirect to login page after successful verification
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error verifying email");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return <div>Verifying your email...</div>;
};

export default VerifyEmail;
