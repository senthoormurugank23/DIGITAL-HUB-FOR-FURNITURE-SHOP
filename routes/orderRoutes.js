import express from "express";
import orderModel from "../models/orderModel.js";

import {
  getUserOrders,
  orderProductPhotoController,
  updateOrderStatus,
  getAllOrders,
  deleteOrder,
  cancelOrderByAdmin,
} from "../controllers/orderController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Fetch User Orders
router.get("/user-orders", requireSignIn, getUserOrders);

// ✅ Serve Product Images for Orders
router.get("/order-product-photo/:pid", orderProductPhotoController);

// ✅ Fetch all orders (Admin only)
router.get("/all-orders", requireSignIn, isAdmin, getAllOrders);

// ✅ Update order status (Admin only)
router.put(
  "/update-status/:orderId",
  requireSignIn,
  isAdmin,
  updateOrderStatus
);

router.delete("/delete/:orderId", requireSignIn, isAdmin, deleteOrder);

router.post("/cancel-request", requireSignIn, async (req, res) => {
  const { orderId } = req.body;
  try {
    const order = await orderModel.findById(orderId);
    if (!order || order.status === "Cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Order cannot be cancelled" });
    }

    // Update the order to mark it as cancellation requested
    order.cancelRequested = true;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Cancellation request sent successfully",
    });
  } catch (error) {
    console.error("Error sending cancellation request:", error);
    res.status(500).json({
      success: false,
      message: "Error sending cancellation request",
      error,
    });
  }
});

// Admin cancels order after user requests cancellation
router.put(
  "/admin/cancel-order/:orderId",
  requireSignIn,
  isAdmin,
  cancelOrderByAdmin
);

export default router;
