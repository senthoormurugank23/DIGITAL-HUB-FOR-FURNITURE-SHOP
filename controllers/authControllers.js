import userModel from "../models/userModel.js";
// import orderModel from "../models/orderModel.js";
import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";
import dns from "dns";
// Load environment variables
dotenv.config();

export const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Step 1: Check if an unverified user exists with the same email
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      // If the user exists but has not verified their email
      if (!existingUser.emailVerified) {
        // Option 1: Delete the unverified user and allow re-registration
        await userModel.deleteOne({ email });

        // Proceed with new registration
        const hashedPassword = await hashPassword(password);
        const verificationToken = JWT.sign({ email }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        const newUser = await new userModel({
          name,
          email,
          password: hashedPassword,
          verificationToken,
        }).save();

        // Send verification email to the user again
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

        const mailOptions = {
          from: `"SAP Furnitures" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Email Verification",
          text: `Please click the following link to verify your email: ${verificationLink}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            return res.status(500).json({
              success: false,
              message: "Failed to send verification email",
            });
          } else {
            console.log("Verification email sent:", info.response);
            res.status(201).json({
              success: true,
              message:
                "User registered successfully. Please check your email for verification.",
            });
          }
        });
      } else {
        // Option 2: If the user is already verified
        return res.status(400).json({
          success: false,
          message: "User already registered. Please log in.",
        });
      }
    } else {
      // If the email is not registered, proceed with normal registration
      const hashedPassword = await hashPassword(password);
      const verificationToken = JWT.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      const newUser = await new userModel({
        name,
        email,
        password: hashedPassword,
        verificationToken,
      }).save();

      // Send verification email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

      const mailOptions = {
        from: `"SAP Furnitures" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Email Verification",
        text: `Please click the following link to verify your email: ${verificationLink}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to send verification email",
          });
        } else {
          console.log("Verification email sent:", info.response);
          res.status(201).json({
            success: true,
            message:
              "User registered successfully. Please check your email for verification.",
          });
        }
      });
    }
  } catch (error) {
    console.error("Error during registration:", error);
    res
      .status(500)
      .json({ success: false, message: "Error during registration" });
  }
};

// Verify email route
export const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token using JWT
    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    // Find the user by email and update the verified field
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.emailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    // Mark the email as verified
    user.emailVerified = true;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ success: false, message: "Error verifying email" });
  }
};

//POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if the user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }

    // Check if the user's email is verified
    if (!user.emailVerified) {
      return res.status(403).send({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    // Check password match
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate JWT token
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Send response with the user data and token
    res.status(200).send({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        addresses: user.addresses, // Include full addresses array
        phone: user.addresses.length > 0 ? user.addresses[0].phone : "N/A",
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//testController
export const testController = (req, res) => {
  try {
    res.send("protected Routes");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

//update prfole
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await userModel.findById(req.user._id);

    // ✅ Validate Password Length
    if (password && password.length < 6) {
      return res.json({ error: "Password must be at least 6 characters long" });
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error While Updating Profile",
      error,
    });
  }
};

//user list

// Get all users
export const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel
      .find({ role: { $ne: 1 }, emailVerified: true })
      .select("-password"); // Exclude admin users

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Delete user
export const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await userModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

// Allowed Districts in Tamil Nadu
const validDistricts = [
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

// ✅ Add Address (Max 2 Addresses)

export const addAddress = async (req, res) => {
  try {
    const { userId, address } = req.body;

    // Validate required fields
    if (
      !address.apartmentNo ||
      !address.residencyAddress ||
      !address.district ||
      !address.pincode ||
      !address.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields including phone are required",
      });
    }

    // Validate phone number
    if (!/^\d{10}$/.test(address.phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be a 10-digit number",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.addresses.length >= 2) {
      return res.status(400).json({
        success: false,
        message: "Maximum 2 addresses allowed",
      });
    }

    // Add address and save
    user.addresses.push(address);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res
      .status(500)
      .json({ success: false, message: "Error adding address", error });
  }
};

// ✅ Update Address
export const updateAddress = async (req, res) => {
  try {
    const { userId, index, address } = req.body;

    // Validate fields
    if (
      !address.apartmentNo ||
      !address.residencyAddress ||
      !address.district ||
      !address.pincode ||
      !address.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields including phone are required",
      });
    }

    if (!/^\d{10}$/.test(address.phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be a 10-digit number",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (index < 0 || index >= user.addresses.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid address index",
      });
    }

    // Update address
    user.addresses[index] = address;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error updating address", error });
  }
};

// ✅ Select Address for Checkout
export const selectAddress = async (req, res) => {
  try {
    const { userId, index } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (index < 0 || index >= user.addresses.length) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid address index" });
    }

    user.selectedAddress = user.addresses[index];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Address selected successfully",
      selectedAddress: user.selectedAddress,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error selecting address", error });
  }
};

// ✅ Delete Address
export const deleteAddress = async (req, res) => {
  try {
    const { userId } = req.body; // ✅ Keep userId in the request body
    const index = parseInt(req.params.index); // ✅ Get index from URL parameters

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (index < 0 || index >= user.addresses.length) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid address index" });
    }

    // ✅ Remove the address at the specified index
    user.addresses.splice(index, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting address", error });
  }
};

// ✅ Get User Addresses
export const getUserAddresses = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching addresses", error });
  }
};

// const mailOptions = {
//   from: `"SAP Furnitures" <${process.env.EMAIL_USER}>`,
//   to: "senthoormarvelous@gmail.com", // Change this to your test email
//   subject: "Test Email",
//   text: "This is a test email from Nodemailer setup.",
// };

// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.error("Test Email Failed:", error);
//   } else {
//     console.log("Test Email Sent Successfully:", info.response);
//   }
// });

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate & Send OTP
export const sendOTPController = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate OTP (6-digit)
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 mins

    // Save OTP to database
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Email Setup
    const mailOptions = {
      from: `"SAP Furnitures" <${process.env.EMAIL_USER}>`, // Ensure correct sender format
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ success: false, message: "Failed to send OTP email" });
      } else {
        console.log("Email sent successfully:", info.response);
        return res
          .status(200)
          .json({ success: true, message: "OTP sent to email" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error sending OTP" });
  }
};

export const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check user and OTP validity
    const user = await userModel.findOne({ email, otp });
    if (!user || user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // OTP is valid, allow password reset
    res.status(200).json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Password validation (same as frontend)
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 1 uppercase letter, 1 number, 1 special character, and be at least 6 characters long.",
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear OTP
    await userModel.findOneAndUpdate(
      { email },
      { password: hashedPassword, otp: null, otpExpires: null }
    );

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
    });
  }
};

export const getUserDetailsController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password"); // Ensure addresses are included

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.addresses.length > 0 ? user.addresses[0].phone : "N/A", // ✅ Fix
        addresses: user.addresses,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching user details", error });
  }
};
