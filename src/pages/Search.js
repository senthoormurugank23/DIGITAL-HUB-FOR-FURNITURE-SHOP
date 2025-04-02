import React from "react";
import Layout from "./../components/Layout/Layout";
import { useSearch } from "../context/search";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import axios from "axios";

const Search = () => {
  const [values] = useSearch();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const { cart, fetchCartData } = useCart();
  const cartItems = cart.map((p) => p?.product?._id || "");

  // ADD TO CART FUNCTION
  const addToCartHandler = async (product) => {
    if (!auth?.user) {
      toast.error("Please log in to add items to cart");
      navigate("/login");
      return;
    }

    try {
      if (cartItems.includes(product._id)) {
        navigate("/cart");
        return;
      }

      const response = await axios.post("/api/v1/cart/add", {
        userId: auth.user._id,
        productId: product._id,
        quantity: 1,
      });

      if (response.data.success) {
        toast.success("Item added to cart");
        fetchCartData();
      } else {
        toast.error("Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Layout title={"Search results"}>
      <div className="container">
        <div className="text-center">
          <h1>Search Results</h1>
          <h6>
            {values?.results.length < 1
              ? "No Products Found"
              : `Found ${values?.results.length}`}
          </h6>
          <div className="d-flex flex-wrap gap-4 justify-content-center product mt-4">
            {values?.results.map((p) => (
              <div
                className="card m-2 rounded text-left product-box"
                key={p?._id}
                style={{ width: "18rem", height: "450px" }}
              >
                <img
                  src={`/api/v1/product/product-photo/${p?._id}`}
                  className="card-img-top"
                  alt={p?.name || "Product"}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                  }}
                />
                <div className="card-body text-dark text-left">
                  <h5 className="card-title p-name">
                    {p?.name || "Unnamed Product"}
                  </h5>
                  <p className="card-text p-desc">
                    {p?.description?.substring(0, 30) || "No description"}...
                  </p>
                  <h5 className="card-title card-price p-price">
                    {p?.price
                      ? p.price.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })
                      : "Price Not Available"}
                  </h5>
                  <p
                    className={p?.quantity > 0 ? "text-success" : "text-danger"}
                  >
                    {p?.quantity > 0 ? "Stock In" : "Out of Stock"}
                  </p>
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-info"
                      onClick={() => navigate(`/product/${p?.slug || ""}`)}
                    >
                      More Details
                    </button>
                    {auth?.user?.role !== 1 && ( // Hide "Add to Cart" button for admins
                      <button
                        className="btn btn-dark"
                        disabled={p?.quantity <= 0}
                        onClick={() => addToCartHandler(p)}
                      >
                        {cartItems.includes(p?._id)
                          ? "Go to Cart"
                          : "Add to Cart"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
