import { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./auth";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [auth] = useAuth();

  useEffect(() => {
    if (auth?.user) {
      fetchCartData();
    } else {
      setCart([]); // ✅ Reset cart if user logs out
      setCartQuantity(0);
    }
  }, [auth]);

  const fetchCartData = async () => {
    if (!auth?.user) return;
    try {
      const { data } = await axios.get(`/api/v1/cart/${auth.user._id}`);
      if (data.success) {
        setCart(data.cart.products);
        setCartQuantity(
          data.cart.products.reduce((total, item) => total + item.quantity, 0)
        );
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, setCart, cartQuantity, setCartQuantity, fetchCartData }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook
const useCart = () => useContext(CartContext);

export { useCart, CartProvider };
