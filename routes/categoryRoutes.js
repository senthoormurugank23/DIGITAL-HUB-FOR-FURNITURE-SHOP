import express from "express";
import formidable from "express-formidable"; // ✅ Import formidable
import {
  createCategoryController,
  updateCategoryController,
  categoryController,
  singleCategoryController,
  deleteCategoryContoller,
  getCategoryPhoto,
} from "../controllers/categoryController.js";
import { isAdmin, requireSignIn } from "./../middlewares/authMiddleware.js";

const router = express.Router();

// **Create Category Route**
router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  formidable(), // ✅ Handle image uploads
  createCategoryController
);

// **Update Category Route**
router.put(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  formidable(), // ✅ Handle image updates
  updateCategoryController
);

// **Get All Categories**
router.get("/get-category", categoryController);

// **Get Single Category**
router.get("/single-category/:slug", singleCategoryController);

// **Delete Category**
router.delete(
  "/delete-category/:id",
  requireSignIn,
  isAdmin,
  deleteCategoryContoller
);

// **Get Category Image**
router.get("/category-photo/:id", getCategoryPhoto);

export default router;
