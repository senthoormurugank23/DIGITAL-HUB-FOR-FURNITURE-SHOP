import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, products: [] });
    }

    const productIndex = cart.products.findIndex((p) =>
      p.product.equals(productId)
    );

    if (productIndex !== -1) {
      return res.status(400).json({
        success: false,
        message: "Product already in cart. Go to cart to update quantity.",
      });
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: userId });

    if (!cart)
      return res
        .status(400)
        .json({ success: false, message: "Cart not found" });

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (quantity > product.quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Stock limit exceeded" });
    }

    const productIndex = cart.products.findIndex((p) =>
      p.product.equals(productId)
    );

    if (productIndex !== -1) {
      cart.products[productIndex].quantity = quantity;
    }

    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    let cart = await Cart.findOne({ user: userId });

    if (!cart)
      return res
        .status(400)
        .json({ success: false, message: "Cart not found" });

    cart.products = cart.products.filter((p) => !p.product.equals(productId));
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

export const getUserCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if cart exists for user
    let cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );

    // If cart doesn't exist, create an empty one
    if (!cart) {
      cart = new Cart({ user: userId, products: [] });
      await cart.save();
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Find the cart for the user
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    cart.products = []; // ✅ Clear all items from the cart
    await cart.save(); // ✅ Save changes

    res
      .status(200)
      .json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ success: false, message: "Failed to clear cart" });
  }
};
