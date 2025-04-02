import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/auth";
import Layout from "../../components/Layout/Layout";
import UserMenu from "../../components/Layout/UserMenu";
import axios from "axios";

const UserDetails = () => {
  const [auth] = useAuth();
  const [userData, setUserData] = useState(null);

  // Fetch user details dynamically
  const fetchUserDetails = useCallback(async () => {
    try {
      console.log("Fetching user details...");
      const { data } = await axios.get("/api/v1/auth/user-details", {
        headers: { Authorization: auth?.token },
      });

      console.log("API Response:", data); // ✅ Log API response

      if (data.success) {
        setUserData(data.user);
      } else {
        console.error("Failed to fetch user details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, [auth?.token]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  console.log("Current User Data:", userData); // ✅ Log userData state

  return (
    <Layout>
      <UserMenu />

      <div className="user-details-container">
        <div className="card shadow-sm border-0 rounded p-4">
          <div className="card-body">
            <h2 className="mb-4 text-dark text-center">User Dashboard</h2>

            {/* Profile Icon */}
            <div className="text-center mb-3">
              <i className="bi bi-person-circle text-secondary profile-icon"></i>
            </div>

            {/* User Details Table */}
            <div className="table-responsive">
              <table className="table table-bordered user-details-table">
                <tbody>
                  <tr>
                    <th>Name</th>
                    <td>{userData?.name || "Loading..."}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{userData?.email || "Loading..."}</td>
                  </tr>
                  <tr>
                    <th>Contact</th>
                    <td>{userData?.phone || "N/A"}</td> {/* ✅ Fix */}
                  </tr>
                  <tr>
                    <th>Address</th>
                    <td>
                      {userData?.addresses?.length > 0
                        ? `${userData.addresses[0].apartmentNo}, ${userData.addresses[0].residencyAddress}, ${userData.addresses[0].district}, ${userData.addresses[0].state}, ${userData.addresses[0].pincode}`
                        : "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <th>Role</th>
                    <td>{userData?.role === 1 ? "Admin" : "User"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .user-details-container {
            margin: 40px auto;
            max-width: 800px;
          }

          .card {
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }

          .profile-icon {
            font-size: 4rem;
          }

          .user-details-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #fff;
          }

          .user-details-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            padding: 12px;
            text-align: left;
          }

          .user-details-table td {
            padding: 12px;
            text-align: left;
            color: #333;
          }

          .user-details-table th, .user-details-table td {
            border: 1px solid #ddd;
          }
        `}
      </style>
    </Layout>
  );
};

export default UserDetails;
