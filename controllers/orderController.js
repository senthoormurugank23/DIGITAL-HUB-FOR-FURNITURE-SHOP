import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import { razorpay } from "../controllers/razorpayController.js"; // Import Razorpay instance

export const getUserOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ userId: req.user._id })
      .populate({
        path: "items.productId",
        select: "name dimensions weight", // Fetch product details including dimensions & weight
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching orders", error });
  }
};

// ✅ Fetch Product Photo for Orders
export const orderProductPhotoController = async (req, res) => {
  try {
    const { pid } = req.params;

    // ✅ Validate product ID
    if (!pid || pid.length !== 24) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product ID" });
    }

    const product = await productModel.findById(pid).select("photo");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (!product.photo || !product.photo.data) {
      return res
        .status(404)
        .json({ success: false, message: "Image not available" });
    }

    res.set("Content-Type", product.photo.contentType);
    return res.status(200).send(product.photo.data.buffer);
  } catch (error) {
    console.error("❌ Error fetching order product photo:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching product photo", error });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("userId", "name email phone") // ✅ Fetch user details
      .populate({
        path: "items.productId",
        select: "name price dimensions weight", // ✅ Fetch dimensions & weight
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("❌ Error fetching all orders:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching orders", error });
  }
};
// ✅ Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      {
        $set: { status },
        $push: { statusHistory: { status, date: new Date() } },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating order status", error });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await orderModel.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    res
      .status(500)
      .json({ success: false, message: "Error deleting order", error });
  }
};
// View Cancellation Requests
export const getCancellationRequests = async (req, res) => {
  try {
    const orders = await orderModel.find({
      status: "Paid",
      cancelRequested: true,
    });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching cancellation requests",
      error,
    });
  }
};

// Admin Cancels Order
export const cancelOrderByAdmin = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await orderModel.findById(orderId);
    if (!order || order.status === "Cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Order already cancelled" });
    }

    // Ensure the user has requested cancellation
    if (!order.cancelRequested) {
      return res
        .status(400)
        .json({ success: false, message: "Cancellation request not made" });
    }

    // Use the paymentId to refund
    const refundStatus = await processRazorpayRefund(
      order.paymentDetails.paymentId
    ); // Use paymentId here
    if (!refundStatus.success) {
      return res.status(400).json({ success: false, message: "Refund failed" });
    }

    // **Restock the quantity in product model**
    for (let item of order.items) {
      // Find the product and update its quantity
      const product = await productModel.findById(item.productId);
      if (product) {
        // Restock the product quantity
        product.quantity += item.quantity; // Increase the stock by the quantity of the cancelled item
        await product.save(); // Save the updated product quantity
      }
    }

    // Update the order status to 'Cancelled'
    order.status = "Cancelled";
    order.cancelRequested = false;
    order.statusHistory.push({ status: "Cancelled", date: new Date() });
    await order.save();

    res.status(200).json({
      success: true,
      message:
        "Order cancelled, refund processed, and product quantity restocked",
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res
      .status(500)
      .json({ success: false, message: "Error cancelling order", error });
  }
};

// Razorpay Refund Logic
const processRazorpayRefund = async (paymentId) => {
  try {
    // Call Razorpay refund API using the paymentId
    const razorpayResponse = await razorpay.payments.refund(paymentId); // Use paymentId, not orderId
    return { success: true, data: razorpayResponse };
  } catch (error) {
    console.error("Error refunding payment via Razorpay:", error);
    return { success: false, message: "Refund failed" };
  }
};
