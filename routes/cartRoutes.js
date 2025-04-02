import express from "express";
import {
  addToCart,
  updateCart,
  removeCartItem,
  getUserCart,
  clearCart,
} from "../controllers/cartController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", requireSignIn, addToCart);
router.put("/update", requireSignIn, updateCart);
router.delete("/remove", requireSignIn, removeCartItem);
router.get("/:userId", requireSignIn, getUserCart);

router.delete("/clear/:userId", requireSignIn, clearCart);

export default router;
