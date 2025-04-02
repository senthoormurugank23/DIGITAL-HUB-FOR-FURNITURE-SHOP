import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout/Layout";
import AdminMenu from "./../../components/Layout/AdminMenu";
import toast from "react-hot-toast";
import axios from "axios";
import { Select } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/updateProduct.css";

const { Option } = Select;

const UpdateProduct = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [photo, setPhoto] = useState("");
  const [id, setId] = useState("");

  // New states for dimensions & weight
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [widthUnit, setWidthUnit] = useState("cm");
  const [depthUnit, setDepthUnit] = useState("cm");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");

  // Fetch single product details
  const getSingleProduct = async () => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/get-product/${params.slug}`
      );

      if (data?.product) {
        setName(data.product.name);
        setId(data.product._id);
        setDescription(data.product.description);
        setPrice(data.product.price);
        setQuantity(data.product.quantity);
        setCategory(data.product.category?._id || "");

        if (data.product.dimensions) {
          setHeight(data.product.dimensions?.height?.value || "");
          setHeightUnit(data.product.dimensions?.height?.unit || "cm");
          setWidth(data.product.dimensions?.width?.value || "");
          setWidthUnit(data.product.dimensions?.width?.unit || "cm");
          setDepth(data.product.dimensions?.depth?.value || "");
          setDepthUnit(data.product.dimensions?.depth?.unit || "cm");
        }

        if (data.product.weight) {
          setWeight(data.product.weight?.value || "");
          setWeightUnit(data.product.weight?.unit || "kg");
        }
      }
    } catch (error) {
      toast.error("Error fetching product details");
    }
  };

  useEffect(() => {
    getSingleProduct();
    //eslint-disable-next-line
  }, []);

  // Fetch all categories
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

  // Validate form fields
  const validateForm = () => {
    // Check required fields
    if (!name) {
      toast.error("Product name is required");
      return false;
    }
    if (!description) {
      toast.error("Product description is required");
      return false;
    }
    if (!price) {
      toast.error("Price is required");
      return false;
    }
    if (!quantity) {
      toast.error("Quantity is required");
      return false;
    }
    if (!category) {
      toast.error("Category is required");
      return false;
    }

    // Check for negative values
    if (price <= 0) {
      toast.error("Price must be greater than 0");
      return false;
    }
    if (quantity < 0) {
      toast.error("Quantity Not be a Negative number");
      return false;
    }
    if (height && height <= 0) {
      toast.error("Height must be greater than 0");
      return false;
    }
    if (width && width <= 0) {
      toast.error("Width must be greater than 0");
      return false;
    }
    if (depth && depth <= 0) {
      toast.error("Depth must be greater than 0");
      return false;
    }
    if (weight && weight <= 0) {
      toast.error("Weight must be greater than 0");
      return false;
    }

    return true;
  };

  // Update product
  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      const productData = new FormData();
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("quantity", quantity);
      photo && productData.append("photo", photo);
      productData.append("category", category);

      // Add dimensions & weight if provided
      if (height) productData.append("dimensions[height][value]", height);
      productData.append("dimensions[height][unit]", heightUnit);

      if (width) productData.append("dimensions[width][value]", width);
      productData.append("dimensions[width][unit]", widthUnit);

      if (depth) productData.append("dimensions[depth][value]", depth);
      productData.append("dimensions[depth][unit]", depthUnit);

      if (weight) productData.append("weight[value]", weight);
      productData.append("weight[unit]", weightUnit);

      const { data } = await axios.put(
        `/api/v1/product/update-product/${id}`,
        productData
      );
      if (data?.success) {
        toast.success("Product Updated Successfully");
        navigate("/dashboard/admin/products");
      } else {
        toast.error(data?.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  // Delete product
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      const { data } = await axios.delete(
        `/api/v1/product/delete-product/${id}`
      );
      if (data.success) {
        toast.success("Product Deleted Successfully");
        navigate("/dashboard/admin/products");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout title="Dashboard - Update Product">
      <AdminMenu />
      <div className="container mt-4">
        <h1 className="text-center mb-4">Update Product</h1>
        <div className="card p-4 shadow-lg w-75 mx-auto">
          {/* Category Select */}
          <div className="form-group">
            <label>
              Category <span className="text-danger">*</span>
            </label>
            <Select
              bordered={false}
              placeholder="Select a category"
              size="large"
              showSearch
              className="form-select mb-3"
              onChange={(value) => setCategory(value)}
              value={category}
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
          {photo ? (
            <div className="text-center mb-3">
              <img
                src={URL.createObjectURL(photo)}
                alt="product_photo"
                height={"200px"}
                className="img img-responsive"
              />
            </div>
          ) : (
            <div className="text-center mb-3">
              <img
                src={`/api/v1/product/product-photo/${id}`}
                alt="product_photo"
                height={"200px"}
                className="img img-responsive"
              />
            </div>
          )}

          {/* Form Fields */}
          <div className="form-group">
            <label>
              Product Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              placeholder="Product Name"
              className="form-control mb-3"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Product Description <span className="text-danger">*</span>
            </label>
            <textarea
              value={description}
              placeholder="Product Description"
              className="form-control mb-3"
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Price <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              value={price}
              placeholder="Price"
              className="form-control mb-3"
              onChange={(e) => setPrice(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Quantity <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              value={quantity}
              placeholder="Quantity"
              className="form-control mb-3"
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
            />
          </div>

          {/* Dimensions & Weight Fields */}
          <div className="form-group">
            <label>Dimensions </label>
            <div className="row">
              <div className="col-md-4">
                <label>Height</label>
                <input
                  type="number"
                  value={height}
                  placeholder="Height"
                  className="form-control mb-2"
                  onChange={(e) => setHeight(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
                <Select
                  className="form-select mb-3"
                  value={heightUnit}
                  onChange={(value) => setHeightUnit(value)}
                >
                  <Option value="cm">cm</Option>
                  <Option value="in">in</Option>
                </Select>
              </div>
              <div className="col-md-4">
                <label>Width</label>
                <input
                  type="number"
                  value={width}
                  placeholder="Width"
                  className="form-control mb-2"
                  onChange={(e) => setWidth(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
                <Select
                  className="form-select mb-3"
                  value={widthUnit}
                  onChange={(value) => setWidthUnit(value)}
                >
                  <Option value="cm">cm</Option>
                  <Option value="in">in</Option>
                </Select>
              </div>
              <div className="col-md-4">
                <label>Depth</label>
                <input
                  type="number"
                  value={depth}
                  placeholder="Depth"
                  className="form-control mb-2"
                  onChange={(e) => setDepth(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
                <Select
                  className="form-select mb-3"
                  value={depthUnit}
                  onChange={(value) => setDepthUnit(value)}
                >
                  <Option value="cm">cm</Option>
                  <Option value="in">in</Option>
                </Select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Weight (Optional)</label>
            <input
              type="number"
              value={weight}
              placeholder="Weight"
              className="form-control mb-2"
              onChange={(e) => setWeight(e.target.value)}
              min="0.01"
              step="0.01"
            />
            <Select
              className="form-select mb-3"
              value={weightUnit}
              onChange={(value) => setWeightUnit(value)}
            >
              <Option value="kg">kg</Option>
              <Option value="lbs">lbs</Option>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-3">
            <button
              className="btn btn-primary flex-grow-1 rounded-5"
              onClick={handleUpdate}
            >
              UPDATE PRODUCT
            </button>
            <button
              className="btn btn-danger flex-grow-1 rounded-5"
              onClick={handleDelete}
            >
              DELETE PRODUCT
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UpdateProduct;
