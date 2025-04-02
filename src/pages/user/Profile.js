import React, { useState, useEffect } from "react";
import UserMenu from "../../components/Layout/UserMenu";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import axios from "axios";
import { IoEye, IoEyeOff } from "react-icons/io5";
import "../../styles/Profile.css"; // Profile styles

const Profile = () => {
  const [auth, setAuth] = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (auth?.user) {
      const { email, name } = auth.user;
      setName(name || "");
      setEmail(email || "");
    } else {
      setName(""); // Clear fields if user logs out
      setEmail("");
    }
  }, [auth?.user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password) {
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
      if (!passwordRegex.test(password)) {
        toast.error(
          "Password must be at least 6 characters long, contain 1 uppercase letter, 1 number, and 1 special character"
        );
        return;
      }
    }

    try {
      const { data } = await axios.put("/api/v1/auth/profile", {
        name,
        email,
        password,
      });

      if (data?.error) {
        toast.error(data?.error);
      } else {
        setAuth({ ...auth, user: data?.updatedUser });
        let ls = localStorage.getItem("auth");
        ls = JSON.parse(ls);
        ls.user = data.updatedUser;
        localStorage.setItem("auth", JSON.stringify(ls));
        toast.success("Profile Updated Successfully");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout title={"Your Profile"}>
      {/* Top Navbar */}
      <UserMenu />

      <div className="profile-container">
        <h2 className="text-center">User Profile</h2>
        <div className="profile-form-container">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                placeholder="Enter Your Name"
                autoFocus
              />
            </div>

            <div className="mb-3">
              <input
                type="email"
                value={email}
                className="form-control"
                placeholder="Enter Your Email"
                disabled
              />
            </div>

            <div className="mb-3 position-relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="Enter Your Password"
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEye size={20} /> : <IoEyeOff size={20} />}
              </span>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              UPDATE
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
