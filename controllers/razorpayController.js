import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";
import orderModel from "../models/orderModel.js";
import mongoose from "mongoose";
import productModel from "../models/productModel.js";
dotenv.config();

// ✅ Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { userId, items, totalPrice, selectedAddress } = req.body;

    // ✅ Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID format" });
    }

    // ✅ Validate selectedAddress
    if (!selectedAddress || !selectedAddress.apartmentNo) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid address format" });
    }

    // ✅ Fetch product details before saving order
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        const product = await productModel
          .findById(item.productId)
          .select("name price");
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        return {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        };
      })
    );

    // ✅ Step 1: Create Razorpay Order
    const options = {
      amount: totalPrice * 100, // Convert INR to paisa
      currency: "INR",
      receipt: `order_${new Date().getTime()}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    console.log("✅ Razorpay Order Created:", razorpayOrder);

    // ✅ Step 2: Save order in MongoDB
    const newOrder = new orderModel({
      userId,
      items: updatedItems,
      totalPrice,
      selectedAddress,
      paymentDetails: {
        orderId: razorpayOrder.id,
        status: "Pending",
      },
      status: "Not Processed",
    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      razorpayOrder,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      order_id,
      payment_id,
      signature,
      userId,
      items,
      totalPrice,
      selectedAddress,
    } = req.body;

    console.log("✅ Verifying Razorpay Payment...");
    console.log("🔹 Order ID:", order_id);
    console.log("🔹 Payment ID:", payment_id);
    console.log("🔹 Signature:", signature);

    // ✅ Step 1: Validate Signature
    const body = `${order_id}|${payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("❌ Payment Verification Failed: Signature Mismatch");
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    console.log("✅ Payment Verified Successfully!");

    // ✅ Step 2: Update Order Status in Database
    const order = await orderModel.findOneAndUpdate(
      { "paymentDetails.orderId": order_id },
      {
        "paymentDetails.paymentId": payment_id,
        "paymentDetails.status": "Paid",
        status: "Processing",
        $push: {
          statusHistory: {
            status: "Processing",
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    console.log("✅ Order updated to 'Processing'.");

    // ✅ Step 3: Reduce Product Stock
    for (const item of items) {
      if (!item.product || !item.product._id) {
        console.error("❌ Missing productId in order item:", item);
        continue; // Skip this item if productId is missing
      }

      console.log(
        `🔹 Processing item: ${item.product._id}, Quantity: ${item.quantity}`
      );

      // Find the product by ID
      const product = await productModel.findById(item.product._id);
      if (!product) {
        console.error(`❌ Product not found: ${item.product._id}`);
        continue; // Skip this product if not found
      }

      console.log(
        `✅ Found product: ${product.name}, Current Stock: ${product.quantity}`
      );

      // Reduce stock safely
      product.quantity = Math.max(0, product.quantity - item.quantity);

      // ✅ Save without triggering validation
      await product.save({ validateBeforeSave: false });

      console.log(
        `✅ Stock updated: ${product.name}, New Stock: ${product.quantity}`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified, order updated, and stock reduced",
      order,
    });
  } catch (error) {
    console.error("❌ Error Verifying Payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Error verifying payment", error });
  }
};
export { razorpay };
