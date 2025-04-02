import express from "express";
import {
  registerController,
  loginController,
  testController,
  updateProfileController,
  getAllUsersController,
  deleteUserController,
  getUserAddresses,
  addAddress,
  updateAddress,
  selectAddress,
  deleteAddress,
  sendOTPController,
  verifyOTPController,
  resetPasswordController,
  getUserDetailsController,
  verifyEmailController,
} from "../controllers/authControllers.js";

import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

//router obj
const router = express.Router();

//routing

//REGISTER || METHOD POST
router.post("/register", registerController);

router.get("/verify-email/:token", verifyEmailController);

//LOGIN || POST
router.post("/login", loginController);

//test routes
router.get("/test", requireSignIn, isAdmin, testController);

//protected user route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({
    ok: true,
  });
});
//protected admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({
    ok: true,
  });
});

//update profile
router.put("/profile", requireSignIn, updateProfileController);

// Get all users (Admin only)
router.get("/", requireSignIn, isAdmin, getAllUsersController);

// Delete a user (Admin only)
router.delete("/:id", requireSignIn, isAdmin, deleteUserController);

// Get user addresses
router.get("/address/:userId", requireSignIn, getUserAddresses);

// Add a new address
router.post("/add-address", requireSignIn, addAddress);

// Update an existing address
router.put("/update-address", requireSignIn, updateAddress);

// Select an address for checkout
router.put("/select-address", requireSignIn, selectAddress);

// Delete an address
router.delete("/delete-address/:index", requireSignIn, deleteAddress);

// Send OTP
router.post("/send-otp", sendOTPController);

// Verify OTP
router.post("/verify-otp", verifyOTPController);

// Reset Password
router.post("/reset-password", resetPasswordController);

router.get("/user-details", requireSignIn, getUserDetailsController);

export default router;
