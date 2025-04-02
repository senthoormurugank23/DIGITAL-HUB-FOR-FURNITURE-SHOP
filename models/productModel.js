import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity cannot be negative"],
    },
    dimensions: {
      height: {
        value: { type: Number },
        unit: { type: String, enum: ["cm", "in"], default: "cm" },
      },
      width: {
        value: { type: Number },
        unit: { type: String, enum: ["cm", "in"], default: "cm" },
      },
      depth: {
        value: { type: Number },
        unit: { type: String, enum: ["cm", "in"], default: "cm" },
      },
    },
    weight: {
      value: { type: Number },
      unit: { type: String, enum: ["kg", "lbs"], default: "kg" },
    },
    photo: {
      data: Buffer,
      contentType: String,
    },

    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        rating: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        name: { type: String, required: true },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Products", productSchema);
