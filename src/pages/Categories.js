import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useCategory from "../hooks/useCategory";
import Layout from "../components/Layout/Layout";

const Categories = () => {
  const categories = useCategory();

  return (
    <Layout title={"All Categories"}>
      <div className="container mt-5">
        <h2 className="text-center mb-4">Browse Categories</h2>
        <div className="row justify-content-center">
          {categories.map((c) => (
            <div className="col-md-4 col-sm-6 mb-4" key={c._id}>
              <Link to={`/category/${c.slug}`} className="category-link">
                <div className="category-card position-relative">
                  <img
                    src={`/api/v1/category/category-photo/${c._id}`}
                    alt={c.name}
                    className="img-fluid category-image"
                  />
                  <div className="category-overlay">
                    <h4 className="category-name">{c.name}</h4>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for Styling */}
      <style>
        {`
          .category-card {
            position: relative;
            overflow: hidden;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease-in-out;
          }

          .category-card:hover {
            transform: scale(1.05);
          }

          .category-image {
            width: 100%;
            height: 250px;
            object-fit: cover;
            border-radius: 10px;
          }

          .category-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 10px;
          }

          .category-name {
            color: white;
            font-weight: bold;
            font-size: 1.5rem;
            text-align: center;
            text-transform: uppercase;
          }

          .category-link {
            text-decoration: none;
          }
        `}
      </style>
    </Layout>
  );
};

export default Categories;
