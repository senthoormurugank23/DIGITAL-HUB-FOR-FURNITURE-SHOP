import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import AdminMenu from "../../components/Layout/AdminMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Select } from "antd"; // Ant Design Select component

const { Option } = Select;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all"); // Default filter

  // Fetch products based on filter selection
  const fetchProducts = async () => {
    try {
      const endpoint =
        filter === "out-of-stock"
          ? "/api/v1/product/out-of-stock"
          : "/api/v1/product/get-product";
      const { data } = await axios.get(endpoint);

      if (data?.success) {
        setProducts(data.products);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filter]); // Re-fetch when filter changes

  return (
    <Layout title="Dashboard - All Products">
      <AdminMenu />
      <div className="container mt-4">
        <h1 className="text-center mb-4">All Product List</h1>

        {/* Filter Dropdown */}
        <div className="mb-3">
          <Select
            value={filter}
            onChange={setFilter}
            size="large"
            className="form-select w-25"
          >
            <Option value="all">All Products</Option>
            <Option value="out-of-stock">Out of Stock</Option>
          </Select>
        </div>

        <div className="row justify-content-center">
          {products.length > 0 ? (
            products.map((p) => (
              <div key={p._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                <Link
                  to={`/dashboard/admin/product/${p.slug}`}
                  className="product-link text-decoration-none"
                >
                  <div
                    className="card shadow-sm border-0 rounded-4"
                    style={{ width: "16rem" }}
                  >
                    <img
                      src={`/api/v1/product/product-photo/${p._id}`}
                      className="card-img-top rounded-top-4"
                      alt={p.name || "No Name"}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="card-body text-dark">
                      <h6 className="card-title">
                        {p.name || "No Name Available"}
                      </h6>
                      <p className="card-text">
                        {p.description
                          ? p.description.substring(0, 45) + "..."
                          : "No Description Available"}
                      </p>
                      <p
                        className={`fw-bold ${
                          p.quantity === 0 ? "text-danger" : "text-success"
                        }`}
                      >
                        {p.quantity === 0
                          ? "Out of Stock"
                          : `Stock: ${p.quantity}`}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-center">No Products Available</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Products;
