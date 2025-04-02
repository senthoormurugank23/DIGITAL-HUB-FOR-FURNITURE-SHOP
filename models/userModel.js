import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: Number, default: 0 },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    emailVerified: { type: Boolean, default: false },
    addresses: [
      {
        apartmentNo: { type: String, required: true },
        residencyAddress: { type: String, required: true },
        district: { type: String, required: true },
        state: { type: String, default: "Tamil Nadu", required: true },
        pincode: { type: String, required: true, match: /^[0-9]{6}$/ },
        phone: { type: String, required: true, match: /^[0-9]{10}$/ },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("users", userSchema);
