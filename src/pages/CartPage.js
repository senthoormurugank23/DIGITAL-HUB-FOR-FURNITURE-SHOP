import React, { useState, useEffect, useCallback } from "react";
import Layout from "./../components/Layout/Layout";
import { useAuth } from "../context/auth";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTrashAlt } from "react-icons/fa";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cart"; // Import useCart
import "bootstrap/dist/css/bootstrap.min.css";

const CartPage = () => {
  const [auth] = useAuth();
  const { cart, setCart, setCartQuantity } = useCart();
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");

  useEffect(() => {
    if (auth?.user) {
      fetchCart();
      fetchAddresses();
    }
  }, [auth]);

  const handlePayment = async () => {
    try {
      if (!window.Razorpay) {
        toast.error("Razorpay SDK not loaded. Please refresh and try again.");
        return;
      }
      const outOfStockItems = cart.filter(
        (item) => item.product.quantity < item.quantity
      );
      if (outOfStockItems.length > 0) {
        toast.error(
          "Some items in your cart are out of stock. Please update your cart."
        );
        return;
      }

      const selectedAddressObject = addresses.find(
        (addr) => addr._id === selectedAddress
      );
      if (!selectedAddressObject) {
        toast.error("Please select a valid address");
        return;
      }
      const totalAmount = totalPrice().grandTotal;

      // ✅ Check if total amount exceeds ₹50,000
      if (totalAmount > 50000) {
        toast.error("Order total cannot exceed ₹50,000. Please remove items.");
        return;
      }

      // ✅ Step 1: Create Razorpay Order
      const { data } = await axios.post("/api/v1/payment/create-order", {
        userId: auth.user._id,
        items: cart.map((item) => ({
          productId: item.product._id.toString(), // ✅ Convert ObjectId to String
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        totalPrice: totalPrice().grandTotal,
        selectedAddress: selectedAddressObject,
      });

      if (!data.success) {
        toast.error("Failed to create Razorpay order");
        return;
      }

      console.log("✅ Razorpay Order Created:", data.razorpayOrder);

      // ✅ Step 2: Initialize Razorpay UI
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: data.razorpayOrder.amount,
        currency: "INR",
        name: "Furniture Shop",
        description: "Order Payment",
        order_id: data.razorpayOrder.id,
        handler: async function (response) {
          console.log("✅ Razorpay Payment Success:", response);

          // ✅ Step 3: Verify Payment After Successful Payment
          const verifyResponse = await axios.post(
            "/api/v1/payment/verify-payment",
            {
              order_id: data.razorpayOrder.id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              userId: auth.user._id,
              items: cart,
              totalPrice: totalPrice().grandTotal,
              selectedAddress: selectedAddressObject,
            }
          );

          if (verifyResponse.data.success) {
            toast.success("Payment Successful!");
            await axios.delete(`/api/v1/cart/clear/${auth.user._id}`);
            setCart([]);
            navigate("/dashboard/user/orders");
          } else {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: auth.user.name,
          email: auth.user.email,
          contact: auth.user.phone,
        },
        theme: { color: "#3399cc" },
      };

      console.log("✅ Opening Razorpay UI...");
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("❌ Payment Error:", error);
      toast.error("Payment failed");
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`/api/v1/user/address/${auth.user._id}`);
      if (data.success) {
        setAddresses(data.addresses);
        setSelectedAddress(data.addresses[0]?._id || ""); // Set default address
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const fetchCart = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/v1/cart/${auth?.user?._id}`);
      if (data?.success) {
        setCart(data.cart.products || []);
        setCartQuantity(
          data.cart.products.reduce((acc, item) => acc + item.quantity, 0)
        ); // Update cart quantity in header
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }, [auth?.user?._id, setCart, setCartQuantity]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const totalPrice = () => {
    const inStockItems = cart.filter(
      (item) => item.product.quantity >= item.quantity
    );

    const productTotal = inStockItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    const deliveryFee = inStockItems.reduce(
      (acc, item) => acc + 100 * item.quantity,
      0
    ); // ₹100 per product
    return {
      productTotal,
      deliveryFee,
      grandTotal: productTotal + deliveryFee,
    };
  };

  const updateQuantity = async (productId, newQuantity, stock) => {
    if (newQuantity < 1 || newQuantity > stock) return;

    setUpdating(true);
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    try {
      await axios.put("/api/v1/cart/update", {
        userId: auth?.user?._id,
        productId,
        quantity: newQuantity,
      });
      fetchCart();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  const removeCartItem = async (productId) => {
    try {
      await axios.delete("/api/v1/cart/remove", {
        data: { userId: auth?.user?._id, productId },
      });

      // Update cart and badge count
      setCart((prevCart) => {
        const updatedCart = prevCart.filter(
          (item) => item.product._id !== productId
        );
        setCartQuantity(
          updatedCart.reduce((acc, item) => acc + item.quantity, 0)
        );
        return updatedCart;
      });

      toast.success("Item removed");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const clearCart = async () => {
    try {
      const response = await axios.delete(
        `/api/v1/cart/clear/${auth?.user?._id}`
      );

      if (response.data.success) {
        setCart([]);
        setCartQuantity(0); // Reset badge count to zero
        toast.success("Cart cleared successfully");
      } else {
        toast.error("Failed to clear cart");
      }
    } catch (error) {
      toast.error("Something went wrong while clearing the cart");
    }
  };

  return (
    <Layout>
      <div className="container mt-4">
        <h1 className="text-center bg-light p-3 rounded">Your Shopping Cart</h1>

        {cart.length > 0 ? (
          <>
            <div className="d-flex justify-content-end mb-3">
              <button
                className="btn btn-warning"
                onClick={clearCart}
                disabled={updating}
              >
                Clear Cart
              </button>
            </div>

            <div className="row">
              {/* Cart Items Table */}
              <div className="col-md-8">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">Product</th>
                      <th scope="col">Price</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Total</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => {
                      const isOutOfStock =
                        item.product.quantity < item.quantity;
                      return (
                        <tr
                          key={item.product._id}
                          className={isOutOfStock ? "table-danger" : ""}
                        >
                          <td>
                            <img
                              src={`/api/v1/product/product-photo/${item.product._id}`}
                              alt={item.product.name}
                              className="img-thumbnail"
                              style={{ width: "50px", height: "50px" }}
                            />
                            <span className="ms-2">{item.product.name}</span>
                            {isOutOfStock && (
                              <span className="text-danger ms-2">
                                (Out of Stock)
                              </span>
                            )}
                          </td>
                          <td>₹{item.product.price}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                  updateQuantity(
                                    item.product._id,
                                    item.quantity - 1,
                                    item.product.quantity
                                  )
                                }
                                disabled={item.quantity <= 1 || updating}
                              >
                                <AiOutlineMinus />
                              </button>
                              <span className="mx-2">{item.quantity}</span>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                  updateQuantity(
                                    item.product._id,
                                    item.quantity + 1,
                                    item.product.quantity
                                  )
                                }
                                disabled={
                                  item.quantity >= item.product.quantity ||
                                  updating
                                }
                              >
                                <AiOutlinePlus />
                              </button>
                            </div>
                          </td>
                          <td>₹{item.product.price * item.quantity}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => removeCartItem(item.product._id)}
                              disabled={updating}
                            >
                              <FaTrashAlt />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cart Summary with Address Selection */}
              <div className="col-md-4">
                <div className="card border-light shadow-lg">
                  <div className="card-body">
                    <h4 className="card-title">Cart Summary</h4>
                    <hr />
                    <p>
                      <strong>Product Total:</strong> ₹
                      {totalPrice().productTotal.toLocaleString("en-IN")}
                    </p>
                    <p>
                      <strong>Delivery Charges:</strong> ₹
                      {totalPrice().deliveryFee.toLocaleString("en-IN")}
                    </p>
                    <hr />
                    <h5 className="fw-bold">
                      Grand Total: ₹
                      {totalPrice().grandTotal.toLocaleString("en-IN")}
                    </h5>

                    {/* Address Selection Dropdown */}
                    <div className="mt-3">
                      <label>
                        <strong>Select Address</strong>
                      </label>
                      <select
                        className="form-control mt-2"
                        value={selectedAddress}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                      >
                        {addresses.length > 0 ? (
                          addresses.map((address, index) => (
                            <option key={index} value={address._id}>
                              {address.apartmentNo}, {address.residencyAddress},{" "}
                              {address.district}, {address.state},{" "}
                              {address.pincode}
                            </option>
                          ))
                        ) : (
                          <option value="">No addresses available</option>
                        )}
                      </select>
                    </div>

                    {/* Buttons */}
                    <button
                      className="btn btn-primary w-100 mt-3"
                      onClick={() => navigate("/address")}
                    >
                      Manage Addresses
                    </button>
                    <button
                      className="btn btn-success w-100 mt-2"
                      onClick={handlePayment}
                      disabled={!selectedAddress}
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <h3 className="text-center text-muted mt-4">Your cart is empty.</h3>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
