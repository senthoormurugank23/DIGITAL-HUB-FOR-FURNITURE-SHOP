import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import axios from "axios";
import { useAuth } from "../context/auth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const districts = [
  "Ariyalur",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kanchipuram",
  "Kanyakumari",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Salem",
  "Sivaganga",
  "Thanjavur",
  "Theni",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tiruvallur",
  "Tiruvannamalai",
  "Tiruvarur",
  "Tuticorin",
  "Vellore",
  "Villupuram",
  "Virudhunagar",
];

const AddressPage = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [newAddress, setNewAddress] = useState({
    apartmentNo: "",
    residencyAddress: "",
    district: "",
    state: "Tamil Nadu",
    pincode: "",
  });
  const [pincodeError, setPincodeError] = useState("");

  useEffect(() => {
    if (auth?.user) {
      fetchAddresses();
    }
  }, [auth]);

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`/api/v1/user/address/${auth.user._id}`);
      if (data.success) {
        setAddresses(data.addresses);
        setSelectedAddress(data.addresses[0]?._id || "");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const validatePincode = (pincode) => {
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeError("Pincode must be a 6-digit number.");
      return false;
    }
    setPincodeError("");
    return true;
  };

  const handleAddOrUpdateAddress = async () => {
    // ✅ Ensure all required fields are filled
    if (
      !newAddress.apartmentNo.trim() ||
      !newAddress.residencyAddress.trim() ||
      !newAddress.district.trim() ||
      !newAddress.pincode.trim() ||
      !newAddress.phone.trim()
    ) {
      toast.error("All fields are required.");
      return;
    }

    // ✅ Validate Apartment No is a number
    if (isNaN(newAddress.apartmentNo)) {
      toast.error("Apartment No must be a number.");
      return;
    }

    // ✅ Validate Pincode
    if (!validatePincode(newAddress.pincode)) {
      return;
    }

    // ✅ Validate Phone Number
    if (!/^\d{10}$/.test(newAddress.phone)) {
      toast.error("Phone number must be a valid 10-digit number.");
      return;
    }

    try {
      let response;
      if (editingIndex !== null) {
        response = await axios.put(`/api/v1/user/update-address`, {
          userId: auth.user._id,
          index: editingIndex,
          address: newAddress,
        });
      } else {
        if (addresses.length >= 2) {
          toast.error("You can only add a maximum of 2 addresses.");
          return;
        }
        response = await axios.post(`/api/v1/user/add-address`, {
          userId: auth.user._id,
          address: newAddress,
        });
      }

      if (response.data.success) {
        toast.success(
          editingIndex !== null
            ? "Address updated successfully"
            : "Address added successfully"
        );
        fetchAddresses();
        setNewAddress({
          apartmentNo: "",
          residencyAddress: "",
          district: "",
          state: "Tamil Nadu",
          pincode: "",
          phone: "",
        });
        setEditingIndex(null);
      }
    } catch (error) {
      toast.error("Failed to process address");
    }
  };

  const handleSelectAddress = async (index) => {
    try {
      const { data } = await axios.put(`/api/v1/user/select-address`, {
        userId: auth.user._id,
        index,
      });

      if (data.success) {
        toast.success("Address selected successfully");
        navigate("/cart");
      }
    } catch (error) {
      toast.error("Failed to select address");
    }
  };

  const handleDeleteAddress = async (index) => {
    try {
      const { data } = await axios.delete(
        `/api/v1/user/delete-address/${index}`,
        {
          data: { userId: auth.user._id },
        }
      );

      if (data.success) {
        toast.success("Address deleted successfully");
        fetchAddresses();
      }
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  return (
    <Layout>
      <div className="container mt-4">
        <h2 className="text-center">Manage Your Address</h2>

        {/* Existing Addresses */}
        {addresses.map((address, index) => (
          <div key={index} className="border p-3 mb-3">
            <h5>Address {index + 1}</h5>
            <p>
              <strong>Apartment No:</strong> {address.apartmentNo}
            </p>
            <p>
              <strong>Residency Address:</strong> {address.residencyAddress}
            </p>
            <p>
              <strong>District:</strong> {address.district}
            </p>
            <p>
              <strong>State:</strong> {address.state}
            </p>
            <p>
              <strong>Pincode:</strong> {address.pincode}
            </p>
            <p>
              <strong>Phone:</strong> {address.phone}
            </p>

            <button
              className="btn btn-primary me-2"
              onClick={() => {
                setNewAddress(address);
                setEditingIndex(index);
              }}
            >
              Edit Address
            </button>
            <button
              className="btn btn-danger me-2"
              onClick={() => handleDeleteAddress(index)}
            >
              Delete Address
            </button>
            <button
              className="btn btn-warning"
              onClick={() => handleSelectAddress(index)}
            >
              Select This Address
            </button>
          </div>
        ))}

        {/* Add/Edit Address Form */}
        {(addresses.length < 2 || editingIndex !== null) && (
          <div className="border p-3">
            <h5>
              {editingIndex !== null ? "Edit Address" : "Add New Address"}
            </h5>

            <input
              type="text"
              className="form-control mb-2 text-center"
              value={newAddress.state}
              disabled
            />
            <select
              className={`form-control mb-2 text-center ${
                newAddress.district === "" ? "is-invalid" : ""
              }`}
              value={newAddress.district}
              onChange={(e) =>
                setNewAddress({ ...newAddress, district: e.target.value })
              }
            >
              <option value="">Select District (Required)</option>{" "}
              {/* ✅ Make this clear */}
              {districts.map((district, index) => (
                <option key={index} value={district}>
                  {district}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Apartment No (Numbers Only)"
              className={`form-control mb-2 ${
                isNaN(newAddress.apartmentNo) ? "is-invalid" : ""
              }`}
              value={newAddress.apartmentNo}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  // ✅ Allow only numbers
                  setNewAddress({ ...newAddress, apartmentNo: value });
                }
              }}
            />

            {/* ✅ Show error message if user enters non-numeric characters */}
            {isNaN(newAddress.apartmentNo) && (
              <div className="text-danger">Apartment No must be a number.</div>
            )}

            <input
              type="text"
              placeholder="Residency Address"
              className="form-control mb-2"
              value={newAddress.residencyAddress}
              onChange={(e) =>
                setNewAddress({
                  ...newAddress,
                  residencyAddress: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Pincode"
              className={`form-control mb-2 ${
                pincodeError ? "is-invalid" : ""
              }`}
              value={newAddress.pincode}
              onChange={(e) => {
                setNewAddress({ ...newAddress, pincode: e.target.value });
                validatePincode(e.target.value);
              }}
            />
            {pincodeError && <div className="text-danger">{pincodeError}</div>}

            <input
              type="text"
              placeholder="Phone Number"
              className="form-control mb-2"
              value={newAddress.phone}
              onChange={(e) =>
                setNewAddress({ ...newAddress, phone: e.target.value })
              }
            />

            <button className="btn btn-dark" onClick={handleAddOrUpdateAddress}>
              {editingIndex !== null ? "Update Address" : "Add Address"}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AddressPage;
