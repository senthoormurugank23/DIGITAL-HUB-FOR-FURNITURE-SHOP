import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, Radio, Select } from "antd";
import { Prices } from "../components/Prices";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "./../components/Layout/Layout";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import { AiOutlineReload } from "react-icons/ai";
import "../styles/HomePage.css";

const { Option } = Select;

const HomePage = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const { cart, fetchCartData } = useCart();
  const [sortOrder, setSortOrder] = useState("default");

  // Fetch categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) setCategories(data?.category);
    } catch (error) {
      console.log(error);
    }
  };

  // Get total product count
  const getTotal = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/product-count");
      setTotal(data?.total);
    } catch (error) {
      console.log(error);
    }
  };

  // Get all products
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);

      if (data?.success) {
        const updatedProducts = await Promise.all(
          data.products
            .filter((p) => p && p._id)
            .map(async (product) => {
              try {
                const ratingRes = await axios.get(
                  `/api/v1/product/rating/${product._id}`
                );
                return {
                  ...product,
                  averageRating: ratingRes?.data?.avgRating || 0,
                };
              } catch (error) {
                console.error(
                  "Error fetching rating for product:",
                  product._id,
                  error
                );
                return { ...product, averageRating: 0 };
              }
            })
        );
        setProducts(updatedProducts);
      } else {
        setProducts([]);
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      console.log(error);
      setProducts(null);
      toast.error("Error loading products");
    } finally {
      setLoading(false);
    }
  };

  // Load more products
  const loadMore = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);

      if (data?.success) {
        const updatedProducts = await Promise.all(
          data.products
            .filter((p) => p && p._id)
            .map(async (product) => {
              try {
                const ratingRes = await axios.get(
                  `/api/v1/product/rating/${product._id}`
                );
                return {
                  ...product,
                  averageRating: ratingRes?.data?.avgRating || 0,
                };
              } catch (error) {
                console.error(
                  "Error fetching rating for product:",
                  product._id,
                  error
                );
                return { ...product, averageRating: 0 };
              }
            })
        );
        setProducts((prevProducts) => [
          ...(prevProducts || []),
          ...updatedProducts,
        ]);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error loading more products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart on page load
  const fetchCart = async () => {
    if (auth?.user) {
      try {
        const { data } = await axios.get(`/api/v1/cart/${auth.user._id}`);
        if (data.success) {
          setCartItems(data.cart.products.map((p) => p?.product?._id || ""));
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    }
  };

  useEffect(() => {
    getAllCategory();
    getTotal();
    fetchCart();
    fetchCartData();
    getAllProducts();
  }, []);

  useEffect(() => {
    if (page > 1) loadMore();
  }, [page]);

  useEffect(() => {
    setCartItems(cart.map((p) => p?.product?._id || ""));
  }, [cart]);

  // Handle category filter
  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
  };

  // Fetch filtered products
  const filterProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/v1/product/product-filters", {
        checked,
        radio,
      });
      setProducts(data?.products.filter((p) => p && p._id) || []);
    } catch (error) {
      console.log(error);
      setProducts(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checked.length > 0 || radio.length > 0) {
      filterProduct();
    } else {
      getAllProducts();
    }
  }, [checked, radio]);

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

      setCartItems((prevItems) => [...prevItems, product._id]);

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

  const sortProducts = (order) => {
    if (!products) return;

    let sortedProducts = [...products];
    if (order === "highToLow") {
      sortedProducts.sort((a, b) => b.averageRating - a.averageRating);
    } else if (order === "lowToHigh") {
      sortedProducts.sort((a, b) => a.averageRating - b.averageRating);
    }
    setSortOrder(order);
    setProducts(sortedProducts);
  };

  return (
    <Layout title={"All Products - Best Offers"}>
      <div className="container-fluid d-flex gap-3 home-page mb-4">
        <div className="mt-5"></div>

        {/* Sidebar - Filters */}
        <div className="col-md-3 mt-4">
          <div className="filter-box mt-5">
            <h5>Filter By Category</h5>
            <div className="d-flex flex-column">
              {categories?.map((c) => (
                <Checkbox
                  key={c?._id}
                  onChange={(e) =>
                    setChecked(
                      e.target.checked
                        ? [...checked, c?._id]
                        : checked.filter((id) => id !== c?._id)
                    )
                  }
                  className="mb-2"
                >
                  {c?.name}
                </Checkbox>
              ))}
            </div>
            <hr />
            <h5 className="mt-2">Filter By Price</h5>
            <Radio.Group
              onChange={(e) => setRadio(e.target.value)}
              className="d-flex flex-column"
            >
              {Prices?.map((p) => (
                <Radio key={p?._id} value={p?.array} className="mb-2">
                  {p?.name}
                </Radio>
              ))}
            </Radio.Group>

            <h5 className="mt-2">Sort By Star Rating</h5>
            <Select
              value={sortOrder}
              onChange={sortProducts}
              className="w-100 mb-3 mt-1"
            >
              <Option value="default">Default</Option>
              <Option value="highToLow">Highest to Lowest</Option>
              <Option value="lowToHigh">Lowest to Highest</Option>
            </Select>
            <div className="d-flex justify-content-center mb-3">
              <button
                className="button-24 mt-3"
                onClick={() => window.location.reload()}
              >
                RESET FILTERS
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 p-3 rounded main-home">
          <h1 className="text-center mb-3 home-tagline mt-5"></h1>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            {loading ? (
              <div className="text-center mt-4">
                <h4>Loading products...</h4>
                {/* You can add a spinner here if you want */}
              </div>
            ) : products === null ? (
              <div className="text-center mt-4">
                <h4 className="text-danger">Failed to load products</h4>
                <button
                  className="btn btn-primary mt-2"
                  onClick={getAllProducts}
                >
                  Retry
                </button>
              </div>
            ) : products.length > 0 ? (
              products.map((p) => (
                <div
                  className="card m-2 rounded text-left product-box1"
                  key={p?._id}
                  style={{ width: "18rem", height: "450px" }}
                >
                  <img
                    src={`/api/v1/product/product-photo/${p?._id}`}
                    className="card-img-top1"
                    alt={p?.name || "Product"}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                  <div className="card-body1 text-dark text-left">
                    <h5 className="card-title p-name">
                      {p?.name || "Unnamed Product"}
                    </h5>

                    <p className="text-warning fw-bold">
                      ⭐{" "}
                      {p?.averageRating > 0
                        ? p?.averageRating.toFixed(1)
                        : "No Ratings Yet"}
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
                      className={
                        p?.quantity > 0 ? "text-success" : "text-danger"
                      }
                    >
                      {p?.quantity > 0 ? "Stock In" : "Out of Stock"}
                    </p>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="button-31"
                        onClick={() => navigate(`/product/${p?.slug || ""}`)}
                      >
                        More Details
                      </button>
                      {auth?.user?.role !== 1 && (
                        <button
                          className="button-25"
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
              ))
            ) : (
              <h4 className="text-center mt-4">No products available</h4>
            )}
          </div>

          <div className="m-2 p-3 text-center">
            {products && products.length < total && (
              <button
                className="btn"
                onClick={() => setPage(page + 1)}
                disabled={loading}
              >
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    Load More <AiOutlineReload />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
