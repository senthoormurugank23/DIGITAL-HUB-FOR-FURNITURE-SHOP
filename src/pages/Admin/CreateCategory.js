import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout/Layout";
import AdminMenu from "./../../components/Layout/AdminMenu"; // Keep your AdminMenu as the top nav menu
import toast from "react-hot-toast";
import axios from "axios";
import { Modal } from "antd";

const CreateCategory = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedPhoto, setUpdatedPhoto] = useState(null);

  // Fetch all categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      toast.error("Something went wrong while fetching categories");
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  // Create Category
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const categoryData = new FormData();
      categoryData.append("name", name);
      if (photo) categoryData.append("photo", photo);

      const { data } = await axios.post(
        "/api/v1/category/create-category",
        categoryData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data?.success) {
        toast.success(`${name} category created successfully`);
        setName("");
        setPhoto(null);
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error creating category");
    }
  };

  // Update Category
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const categoryData = new FormData();
      categoryData.append("name", updatedName);
      if (updatedPhoto) categoryData.append("photo", updatedPhoto);

      const { data } = await axios.put(
        `/api/v1/category/update-category/${selected._id}`,
        categoryData
      );

      if (data?.success) {
        toast.success(`${updatedName} category updated successfully`);
        setSelected(null);
        setUpdatedName("");
        setUpdatedPhoto(null);
        setVisible(false);
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error updating category");
    }
  };

  // Delete Category
  const handleDelete = async (categoryId) => {
    try {
      const { data } = await axios.delete(
        `/api/v1/category/delete-category/${categoryId}`
      );

      if (data.success) {
        toast.success("Category deleted successfully");
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error deleting category");
    }
  };

  return (
    <Layout title="Dashboard - Manage Categories">
      <AdminMenu /> {/* Top Nav Menu */}
      <div className="container mt-4">
        <h1 className="text-center mb-4">Manage Categories</h1>

        {/* Create Category Form */}
        <div className="p-4 w-50 mx-auto shadow-sm bg-white rounded">
          <form onSubmit={handleSubmit} className="text-center">
            <input
              type="text"
              value={name}
              placeholder="Category Name"
              className="form-control mb-3 text-center"
              onChange={(e) => setName(e.target.value)}
            />
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
            {photo && (
              <div className="text-center mb-3">
                <img
                  src={URL.createObjectURL(photo)}
                  alt="category_photo"
                  height={"200px"}
                  className="img img-responsive rounded"
                />
              </div>
            )}
            <button className="btn btn-primary w-100" type="submit">
              CREATE CATEGORY
            </button>
          </form>
        </div>

        {/* Category List */}
        <div className="w-75 mx-auto mt-4">
          <table className="table table-bordered table-hover text-center shadow-sm">
            <thead className="table-dark">
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Image</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((c) => (
                <tr key={c._id}>
                  <td className="align-middle">{c.name}</td>
                  <td className="align-middle">
                    <img
                      src={`/api/v1/category/category-photo/${c._id}`}
                      alt="Category"
                      className="img-fluid"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "5px",
                      }}
                    />
                  </td>
                  <td className="align-middle">
                    <button
                      className="btn btn-primary me-2"
                      onClick={() => {
                        setVisible(true);
                        setUpdatedName(c.name);
                        setSelected(c);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(c._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Update Category Modal */}
        <Modal
          onCancel={() => setVisible(false)}
          footer={null}
          visible={visible}
        >
          <form onSubmit={handleUpdate} className="text-center">
            <input
              type="text"
              value={updatedName}
              placeholder="Category Name"
              className="form-control mb-3 text-center"
              onChange={(e) => setUpdatedName(e.target.value)}
            />
            <label className="btn btn-outline-secondary w-100 mb-3">
              {updatedPhoto ? updatedPhoto.name : "Upload New Photo"}
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={(e) => setUpdatedPhoto(e.target.files[0])}
                hidden
              />
            </label>
            {updatedPhoto && (
              <div className="text-center mb-3">
                <img
                  src={URL.createObjectURL(updatedPhoto)}
                  alt="category_photo"
                  height={"200px"}
                  className="img img-responsive rounded"
                />
              </div>
            )}
            <button className="btn btn-primary w-100" type="submit">
              UPDATE CATEGORY
            </button>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default CreateCategory;
