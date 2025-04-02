import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import { FaStar, FaShoppingCart } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const ProductDetails = () => {
  const params = useParams();
  const [auth] = useAuth();
  const navigate = useNavigate();
  const { cart, fetchCartData } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (product?._id) {
      fetchReviews(product._id);
    }
  }, [product]);

  useEffect(() => {
    if (params?.slug) {
      getProduct(params.slug);
    }
  }, [params?.slug]);

  useEffect(() => {
    if (product?._id) {
      getProductRating(product._id);
    }
  }, [product]);

  useEffect(() => {
    setCartItems(cart.map((p) => p?.product?._id || ""));
  }, [cart]);

  const fetchReviews = async (productId) => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/get-reviews/${productId}`
      );
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const addReviewHandler = async () => {
    if (!auth?.user) {
      toast.error("Please log in to add a review");
      navigate("/login");
      return;
    }

    try {
      const { data } = await axios.post(
        "/api/v1/product/add-review",
        {
          productId: product._id,
          comment: newReview,
        },
        {
          headers: { Authorization: auth?.token },
        }
      );

      if (data.success) {
        toast.success("Review added");
        setNewReview("");
        fetchReviews(product._id);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add review");
    }
  };

  const getProduct = async (slug) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/get-product/${slug}`);
      if (data?.product) {
        setProduct(data.product);
        getSimilarProducts(data?.product._id, data?.product.category?._id);
      } else {
        toast.error("Product not found!");
        setProduct(null);
      }
    } catch (error) {
      toast.error("Something went wrong");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const getProductRating = async (productId) => {
    try {
      const { data } = await axios.get(`/api/v1/product/rating/${productId}`);

      if (data && data.success) {
        setAverageRating(data.avgRating); // ✅ Set the average rating
        const userRatingData = data.ratings.find(
          (r) => r.user._id === auth?.user?._id
        );
        setUserRating(userRatingData ? userRatingData.rating : 0); // ✅ Set user's rating or default to 0
      }
    } catch (error) {
      console.error("Error fetching rating:", error);
    }
  };

  const submitRating = async (rating) => {
    if (!auth?.user) {
      toast.error("Please log in to rate products");
      return;
    }

    try {
      const { data } = await axios.post(
        "/api/v1/product/rate",
        {
          productId: product._id,
          rating,
        },
        {
          headers: { Authorization: auth?.token },
        }
      );

      toast.success("Rating submitted!");
      setUserRating(rating);
      getProductRating(product._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting rating");
    }
  };

  const getSimilarProducts = async (pid, cid) => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/related-product/${pid}/${cid}`
      );
      setRelatedProducts(data?.products?.filter((p) => p && p._id) || []);
    } catch (error) {
      console.log("Error fetching related products:", error);
    }
  };

  const addToCartHandler = async (product) => {
    if (!auth?.user) {
      toast.error("Please log in to add items to cart");
      navigate("/login");
      return;
    }

    if (auth?.user?.role === 1) {
      toast.error("Admin cannot add products to cart");
      return;
    }

    if (cartItems.includes(product._id)) {
      navigate("/cart");
      return;
    }

    setCartItems((prevItems) => [...prevItems, product._id]);

    try {
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
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  if (loading) {
    return (
      <Layout title="Loading...">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
          }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h2 style={{ marginTop: "1rem" }}>Loading Product Details...</h2>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout title="Product Not Found">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
          }}
        >
          <h2 style={{ color: "red", marginBottom: "1rem" }}>
            Product Not Found!
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => navigate(-1)}
            style={{ marginTop: "1rem" }}
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  // Main container styles
  const containerStyle = {
    maxWidth: "1200px",
    margin: "2rem auto",
    padding: "0 1rem",
  };

  // Product main section styles
  const productMainStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "2rem",
    marginBottom: "3rem",
  };

  // Image container styles
  const imageContainerStyle = {
    flex: 1,
    minWidth: "300px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "20px",
    height: "500px",
  };

  // Image styles
  const imageStyle = {
    maxWidth: "100%",
    maxHeight: "100%",
    width: "auto",
    height: "auto",
    objectFit: "contain",
    borderRadius: "4px",
  };

  // Product info styles
  const productInfoStyle = {
    flex: 1,
    minWidth: "300px",
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  // Title styles
  const titleStyle = {
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "1rem",
    color: "#333",
  };

  // Price styles
  const priceStyle = {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#28a745",
    margin: "1.5rem 0",
  };

  // Original price styles
  const originalPriceStyle = {
    textDecoration: "line-through",
    color: "#6c757d",
    fontSize: "1.2rem",
    marginLeft: "0.5rem",
  };

  // Stock status styles
  const stockInStyle = {
    fontWeight: "600",
    margin: "1.5rem 0",
    padding: "0.5rem",
    borderRadius: "4px",
    display: "inline-block",
    backgroundColor: "#d4edda",
    color: "#155724",
  };

  const stockOutStyle = {
    ...stockInStyle,
    backgroundColor: "#f8d7da",
    color: "#721c24",
  };

  // Add to cart button styles
  const addToCartStyle = {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "0.8rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "600",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    margin: "1.5rem 0",
  };

  // Reviews section styles
  const reviewsSectionStyle = {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginBottom: "3rem",
  };

  // Review card styles
  const reviewCardStyle = {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1rem",
  };

  // Similar products styles
  const similarProductCardStyle = {
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
  };

  return (
    <Layout title={product?.name || "Product Details"}>
      <div style={containerStyle}>
        {/* Product Main Section */}
        <div style={productMainStyle}>
          {/* Product Image */}
          <div style={imageContainerStyle}>
            <img
              src={`/api/v1/product/product-photo/${product?._id}`}
              alt={product?.name || "Product Image"}
              style={imageStyle}
            />
          </div>

          {/* Product Info */}
          <div style={productInfoStyle}>
            <h1 style={titleStyle}>{product?.name}</h1>

            {/* Rating */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.2rem" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    style={{
                      color:
                        star <= Math.round(averageRating) ? "#ffc107" : "#ddd",
                      fontSize: "1.2rem",
                    }}
                  />
                ))}
              </div>
              <span style={{ fontWeight: "600", color: "#333" }}>
                {averageRating > 0
                  ? averageRating.toFixed(1)
                  : "No ratings yet"}
              </span>
              <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>

            {/* Price */}
            <div style={priceStyle}>
              ₹{product?.price.toLocaleString("en-IN")}
              {product?.originalPrice && (
                <span style={originalPriceStyle}>
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Description */}
            <div style={{ margin: "1.5rem 0" }}>
              <h3
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "0.5rem",
                  color: "#333",
                }}
              >
                Description
              </h3>
              <p style={{ color: "#555", lineHeight: "1.6" }}>
                {product?.description}
              </p>
            </div>

            {/* Dimensions */}
            {product?.dimensions && (
              <div style={{ margin: "1.5rem 0" }}>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    marginBottom: "0.5rem",
                    color: "#333",
                  }}
                >
                  Dimensions
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {product.dimensions.height?.value && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#555",
                          fontSize: "0.9rem",
                        }}
                      >
                        Height:
                      </span>
                      <span style={{ fontWeight: "500", color: "#333" }}>
                        {product.dimensions.height.value}{" "}
                        {product.dimensions.height.unit}
                      </span>
                    </div>
                  )}
                  {product.dimensions.width?.value && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#555",
                          fontSize: "0.9rem",
                        }}
                      >
                        Width:
                      </span>
                      <span style={{ fontWeight: "500", color: "#333" }}>
                        {product.dimensions.width.value}{" "}
                        {product.dimensions.width.unit}
                      </span>
                    </div>
                  )}
                  {product.dimensions.depth?.value && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#555",
                          fontSize: "0.9rem",
                        }}
                      >
                        Depth:
                      </span>
                      <span style={{ fontWeight: "500", color: "#333" }}>
                        {product.dimensions.depth.value}{" "}
                        {product.dimensions.depth.unit}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Weight */}
            {product?.weight?.value && (
              <div style={{ margin: "1.5rem 0" }}>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    marginBottom: "0.5rem",
                    color: "#333",
                  }}
                >
                  Weight
                </h3>
                <span style={{ fontWeight: "500", color: "#333" }}>
                  {product.weight.value} {product.weight.unit}
                </span>
              </div>
            )}

            {/* Stock Status */}
            <div style={product?.quantity > 0 ? stockInStyle : stockOutStyle}>
              {product?.quantity > 0
                ? product?.quantity > 5
                  ? "In Stock"
                  : `Only ${product?.quantity} left!`
                : "Out of Stock"}
            </div>

            {/* Add to Cart */}
            {auth?.user?.role !== 1 && (
              <button
                style={{
                  ...addToCartStyle,
                  backgroundColor: cartItems.includes(product?._id)
                    ? "#28a745"
                    : "#007bff",
                  opacity: product?.quantity <= 0 ? 0.65 : 1,
                  cursor: product?.quantity <= 0 ? "not-allowed" : "pointer",
                }}
                onClick={() => addToCartHandler(product)}
                disabled={product?.quantity <= 0}
              >
                <FaShoppingCart />
                {cartItems.includes(product?._id)
                  ? "Go to Cart"
                  : "Add to Cart"}
              </button>
            )}

            {/* Rate Product */}
            {auth?.user && auth?.user.role !== 1 && (
              <div style={{ margin: "1.5rem 0" }}>
                <h4
                  style={{
                    fontSize: "1.1rem",
                    marginBottom: "0.5rem",
                    color: "#333",
                  }}
                >
                  Rate this product:
                </h4>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      style={{
                        color: star <= userRating ? "#ffc107" : "#ddd",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                        transition: "color 0.2s",
                      }}
                      onClick={() => submitRating(star)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div style={reviewsSectionStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", color: "#333" }}>
              Customer Reviews
            </h2>
            {reviews.length > 0 && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    color: "#333",
                  }}
                >
                  {averageRating > 0 ? averageRating.toFixed(1) : "No ratings"}
                </span>
                <div style={{ display: "flex", gap: "0.2rem" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      style={{
                        color:
                          star <= Math.round(averageRating)
                            ? "#ffc107"
                            : "#ddd",
                        fontSize: "1.2rem",
                      }}
                    />
                  ))}
                </div>
                <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>
                  Based on {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}
          </div>

          {reviews.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {reviews
                .slice(0, showAllReviews ? reviews.length : 3)
                .map((review, index) => (
                  <div key={index} style={reviewCardStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <div style={{ fontWeight: "600", color: "#333" }}>
                        {review.name}
                      </div>
                      <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ color: "#555", lineHeight: "1.6" }}>
                      {review.comment}
                    </div>
                  </div>
                ))}

              {reviews.length > 3 && (
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#007bff",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    margin: "1rem auto",
                    padding: "0.5rem",
                  }}
                  onClick={() => setShowAllReviews(!showAllReviews)}
                >
                  {showAllReviews
                    ? "Show Less"
                    : `Show All (${reviews.length})`}
                </button>
              )}
            </div>
          ) : (
            <div
              style={{ textAlign: "center", padding: "2rem", color: "#6c757d" }}
            >
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          )}

          {/* Add Review Form */}
          {auth?.user && auth?.user.role !== 1 && (
            <div style={{ marginTop: "2rem" }}>
              <h3
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "1rem",
                  color: "#333",
                }}
              >
                Write a Review
              </h3>
              <textarea
                style={{
                  width: "100%",
                  padding: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  minHeight: "120px",
                  fontFamily: "inherit",
                  marginBottom: "1rem",
                }}
                rows="4"
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Share your thoughts about this product..."
              ></textarea>
              <button
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "0.8rem 1.5rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                  borderRadius: "4px",
                  cursor: "pointer",
                  opacity: !newReview.trim() ? 0.65 : 1,
                  cursor: !newReview.trim() ? "not-allowed" : "pointer",
                }}
                onClick={addReviewHandler}
                disabled={!newReview.trim()}
              >
                Submit Review
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
