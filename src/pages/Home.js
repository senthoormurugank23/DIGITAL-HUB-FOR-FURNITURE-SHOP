import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import "../styles/collections.css";
import heroImage from "./h1.jpg";
import aboutImage from "./About.png";
import aboutBg from "./AboutBg.jpg";
import { Link } from "react-router-dom";
import useCategory from "../hooks/useCategory";
import axios from "axios";
import { LuArmchair } from "react-icons/lu";
import { IoMdPricetags } from "react-icons/io";
import { BsArrowRight } from "react-icons/bs";

const Home = () => {
  const navigate = useNavigate();
  const categories = useCategory().slice(0, 5);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const { data } = await axios.get("/api/v1/product/latest-products");
        if (data.success) {
          setLatestProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching latest products:", error);
      }
    };

    fetchLatestProducts();
  }, []);

  return (
    <Layout title={"Home - Furniture Shop"}>
      <div className="overall">
        {/* Hero Section */}
        <div
          className="hero-section"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="hero-content">
            <h1>Discover Elegant Furniture</h1>
            <p>Find the perfect furniture to match your style and comfort.</p>
            <button className="button-85 mt-4" onClick={() => navigate("/")}>
              Shop Now
            </button>
          </div>
        </div>

        {/* Shop by Category Section */}
        <section className="shop-by-category">
          <div className="category-header">
            <h2 className="text-center">Shop by Category</h2>
          </div>
          <div className="category-container">
            {categories.map((c) => (
              <Link
                to={`/category/${c.slug}`}
                className="category-link"
                key={c._id}
              >
                <div className="category-card">
                  <img
                    src={`/api/v1/category/category-photo/${c._id}`}
                    alt={c.name}
                    className="category-image"
                  />
                  <div className="category-overlay">
                    <h4 className="category-name">{c.name}</h4>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="latest-arrivals">
          <h2 className="section-title">Latest Arrivals</h2>
          <div className="latest-product-container">
            {latestProducts.length === 0 ? (
              <h4 className="text-center mt-4">No products available</h4>
            ) : (
              latestProducts.map((p) => (
                <div className="product-card" key={p?._id}>
                  <div className="product-image-container">
                    <img
                      src={`/api/v1/product/product-photo/${p?._id}`}
                      className="product-image"
                      alt={p?.name || "Product"}
                    />
                  </div>
                  <div className="product-details">
                    <h5 className="product-name">
                      {p?.name || "Unnamed Product"}
                    </h5>
                    <p className="product-rating">
                      ⭐{" "}
                      {p?.averageRating > 0
                        ? p?.averageRating.toFixed(1)
                        : "No Ratings Yet"}
                    </p>
                    <h5 className="product-price">
                      <IoMdPricetags className="price-icon" />
                      {p?.price
                        ? p.price.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })
                        : "Price Not Available"}
                    </h5>
                    <p
                      className={`product-stock ${
                        p?.quantity > 0 ? "in-stock" : "out-of-stock"
                      }`}
                    >
                      {p?.quantity > 0 ? "In Stock" : "Out of Stock"}
                    </p>
                    <button
                      className="button-87 "
                      onClick={() => navigate(`/product/${p?.slug || ""}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* About Us Section */}
        <section
          className="about-us"
          style={{ backgroundImage: `url(${aboutBg})` }}
        >
          <div className="about-container">
            <div className="about-image">
              <img src={aboutImage} alt="About Us" />
            </div>
            <div className="about-content">
              <h2></h2>
              <p>
                Our mission is to bring you high-quality furniture that not only
                looks great but also feels great. We believe that furniture
                shopping should be a delightful experience, which is why we make
                it easy for you to find the perfect piece for your space.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
