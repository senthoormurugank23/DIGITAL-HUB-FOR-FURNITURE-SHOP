import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalPrice: { type: Number, required: true },
    selectedAddress: {
      type: {
        apartmentNo: String,
        residencyAddress: String,
        district: String,
        state: { type: String, default: "Tamil Nadu" },
        pincode: String,
      },
      required: true,
    },
    paymentDetails: {
      paymentId: String,
      orderId: String,
      method: String,
      status: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending",
      },
    },
    status: {
      type: String,
      default: "Not Processed",
      enum: [
        "Not Processed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
    },
    statusHistory: [
      {
        status: String,
        date: { type: Date, default: Date.now },
      },
    ],
    shippingDate: { type: Date },
    cancelRequested: {
      // <-- Added cancelRequested field
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("orders", orderSchema);
