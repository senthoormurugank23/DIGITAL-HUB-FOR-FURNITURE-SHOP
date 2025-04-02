import express from "express";
import {
  createOrder,
  verifyPayment,
} from "../controllers/razorpayController.js";

const router = express.Router();

// ✅ Create Razorpay Order (Called before payment starts)
router.post("/create-order", createOrder);

// ✅ Verify Payment (Called after payment is completed)
router.post("/verify-payment", verifyPayment);

export default router;
