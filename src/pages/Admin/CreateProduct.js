import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout/Layout";
import AdminMenu from "./../../components/Layout/AdminMenu"; // Top menu instead of sidebar
import toast from "react-hot-toast";
import axios from "axios";
import { Select } from "antd";
import { useNavigate } from "react-router-dom";
import "../../styles/createProduct.css"; // Import the CSS file

const { Option } = Select;

const CreateProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [photo, setPhoto] = useState("");

  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [widthUnit, setWidthUnit] = useState("cm");
  const [depthUnit, setDepthUnit] = useState("cm");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");

  // Fetch categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      toast.error("Something went wrong in getting categories");
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  // Handle product creation
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const productData = new FormData();
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("quantity", quantity);
      productData.append("photo", photo);
      productData.append("category", category);

      // Add optional dimensions & weight
      if (height) productData.append("dimensions[height][value]", height);
      productData.append("dimensions[height][unit]", heightUnit);

      if (width) productData.append("dimensions[width][value]", width);
      productData.append("dimensions[width][unit]", widthUnit);

      if (depth) productData.append("dimensions[depth][value]", depth);
      productData.append("dimensions[depth][unit]", depthUnit);

      if (weight) productData.append("weight[value]", weight);
      productData.append("weight[unit]", weightUnit);

      // Log FormData for debugging
      for (let [key, value] of productData.entries()) {
        console.log(key, value);
      }

      const { data } = await axios.post(
        "/api/v1/product/create-product",
        productData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Ensure proper content type
          },
        }
      );

      if (data?.success) {
        toast.success("Product Created Successfully");
        navigate("/dashboard/admin/products");
      } else {
        toast.error(data?.message);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout title="Dashboard - Create Product">
      <AdminMenu />
      <div className="container mt-4">
        <h1 className="text-center mb-4">Create Product</h1>
        <div className="card p-4 shadow-lg w-75 mx-auto">
          {/* Category Select */}
          <div className="form-group">
            <label>Category</label>
            <Select
              bordered={false}
              placeholder="Select a category"
              size="large"
              showSearch
              className="form-select mb-3"
              onChange={(value) => setCategory(value)}
            >
              {categories?.map((c) => (
                <Option key={c._id} value={c._id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Photo Upload */}
          <div className="form-group">
            <label>Product Photo</label>
            <label className="btn btn-outline-secondary w-100 mb-3">
              {photo ? photo.name : "Upload Photo"}
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                hidden
              />
            </label>
          </div>

          {/* Photo Preview */}
          {photo && (
            <div className="text-center mb-3">
              <img
                src={URL.createObjectURL(photo)}
                alt="product_photo"
                height={"200px"}
                className="img img-responsive rounded"
              />
            </div>
          )}

          {/* Form Fields */}
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={name}
              placeholder="Product Name"
              className="form-control mb-3"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Product Description</label>
            <textarea
              value={description}
              placeholder="Product Description"
              className="form-control mb-3"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              value={price}
              placeholder="Price"
              className="form-control mb-3"
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              placeholder="Quantity"
              className="form-control mb-3"
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Dimensions */}
          <div className="form-group">
            <label>Dimensions</label>
            <div className="row">
              <div className="col-md-4">
                <input
                  type="number"
                  value={height}
                  placeholder="Height"
                  className="form-control mb-2"
                  onChange={(e) => setHeight(e.target.value)}
                />
                <Select
                  className="form-select mb-3"
                  defaultValue="cm"
                  onChange={(value) => setHeightUnit(value)}
                >
                  <Option value="cm">cm</Option>
                  <Option value="in">in</Option>
                </Select>
              </div>
              <div className="col-md-4">
                <input
                  type="number"
                  value={width}
                  placeholder="Width"
                  className="form-control mb-2"
                  onChange={(e) => setWidth(e.target.value)}
                />
                <Select
                  className="form-select mb-3"
                  defaultValue="cm"
                  onChange={(value) => setWidthUnit(value)}
                >
                  <Option value="cm">cm</Option>
                  <Option value="in">in</Option>
                </Select>
              </div>
              <div className="col-md-4">
                <input
                  type="number"
                  value={depth}
                  placeholder="Depth"
                  className="form-control mb-2"
                  onChange={(e) => setDepth(e.target.value)}
                />
                <Select
                  className="form-select mb-3"
                  defaultValue="cm"
                  onChange={(value) => setDepthUnit(value)}
                >
                  <Option value="cm">cm</Option>
                  <Option value="in">in</Option>
                </Select>
              </div>
            </div>
          </div>

          {/* Weight */}
          <div className="form-group">
            <label>Weight</label>
            <div className="row">
              <div className="col-md-6">
                <input
                  type="number"
                  value={weight}
                  placeholder="Weight"
                  className="form-control mb-2"
                  onChange={(e) => setWeight(e.target.value)}
                />
                <Select
                  className="form-select mb-3"
                  defaultValue="kg"
                  onChange={(value) => setWeightUnit(value)}
                >
                  <Option value="kg">kg</Option>
                  <Option value="lbs">lbs</Option>
                </Select>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <button className="btn btn-primary w-100" onClick={handleCreate}>
            CREATE PRODUCT
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProduct;
