import express from "express";
import productModel from "../models/productModel.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createProductController,
  getProductController,
  getSingleProductController,
  productPhotoController,
  deleteProductController,
  updateProductController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  reltedProductController,
  productCategoryController,
  rateProduct,
  getProductRating,
  addReview,
  getReviews,
  productPhotoController1,
  getLatestProductsController,
  getOutOfStockProducts,
} from "../controllers/productController.js";
import formidable from "express-formidable";
const router = express.Router();

//routes
//create product
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

//routes update product
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

//get products
router.get("/get-product", getProductController);

//get single product
router.get("/get-product/:slug", getSingleProductController);

//get phot
router.get("/product-photo/:pid", productPhotoController);

router.get("/photo/:pid", productPhotoController1);

//delete product
router.delete("/delete-product/:pid", deleteProductController);

//filter product
router.post("/product-filters", productFiltersController);

//Product count
router.get("/product-count", productCountController);

//product per page
router.get("/product-list/:page", productListController);

//search product
router.get("/search/:keyword", searchProductController);

//similar product
router.get("/related-product/:pid/:cid", reltedProductController);

//category wise product
router.get("/product-category/:slug", productCategoryController);

// ⭐ Rate a product (Requires authentication)
router.post("/rate", requireSignIn, rateProduct);

// ⭐ Get product ratings
router.get("/rating/:id", getProductRating);

router.post("/add-review", requireSignIn, addReview);

router.get("/get-reviews/:id", getReviews);

router.get("/latest-products", getLatestProductsController);

router.get("/out-of-stock", getOutOfStockProducts);

export default router;
