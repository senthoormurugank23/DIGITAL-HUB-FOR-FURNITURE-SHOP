import productModel from "../models/productModel.js";
import Product from "../models/productModel.js"; // ✅ Import Product Model
import userModel from "../models/userModel.js";
import categoryModel from "../models/categoryModel.js";
import fs from "fs";
import slugify from "slugify";
import Order from "../models/orderModel.js"; // Ensure Order model is imported

export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.fields;
    const { photo } = req.files;

    // Extract optional fields for dimensions and weight
    const dimensions = {
      height: {
        value: req.fields["dimensions[height][value]"] || null,
        unit: req.fields["dimensions[height][unit]"] || "cm",
      },
      width: {
        value: req.fields["dimensions[width][value]"] || null,
        unit: req.fields["dimensions[width][unit]"] || "cm",
      },
      depth: {
        value: req.fields["dimensions[depth][value]"] || null,
        unit: req.fields["dimensions[depth][unit]"] || "cm",
      },
    };

    const weight = {
      value: req.fields["weight[value]"] || null,
      unit: req.fields["weight[unit]"] || "kg",
    };

    // Validate required fields
    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).send({ error: "Required fields are missing" });
    }

    const product = new productModel({
      ...req.fields,
      slug: slugify(name),
      dimensions,
      weight,
    });

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();

    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

//get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      TotalCount: products.length,
      message: "AllProducts ",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting products",
      error: error.message,
    });
  }
};

// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};

// // get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};
export const productPhotoController1 = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (!product.photo || !product.photo.data) {
      return res
        .status(404)
        .json({ success: false, message: "Image not available" });
    }

    res.set("Content-Type", product.photo.contentType);
    return res.status(200).send(product.photo.data);
  } catch (error) {
    console.error("❌ Error fetching product photo:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product photo",
      error,
    });
  }
};

//delete controller
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

//upate producta
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.fields;
    const { photo } = req.files;

    // Extract optional dimensions and weight fields
    const dimensions = {
      height: {
        value: req.fields["dimensions[height][value]"] || null,
        unit: req.fields["dimensions[height][unit]"] || "cm",
      },
      width: {
        value: req.fields["dimensions[width][value]"] || null,
        unit: req.fields["dimensions[width][unit]"] || "cm",
      },
      depth: {
        value: req.fields["dimensions[depth][value]"] || null,
        unit: req.fields["dimensions[depth][unit]"] || "cm",
      },
    };

    const weight = {
      value: req.fields["weight[value]"] || null,
      unit: req.fields["weight[unit]"] || "kg",
    };

    // Ensure numeric values are properly formatted
    if (dimensions.height.value)
      dimensions.height.value = parseFloat(dimensions.height.value);
    if (dimensions.width.value)
      dimensions.width.value = parseFloat(dimensions.width.value);
    if (dimensions.depth.value)
      dimensions.depth.value = parseFloat(dimensions.depth.value);
    if (weight.value) weight.value = parseFloat(weight.value);

    // Find the product to check existing values
    let product = await productModel.findById(req.params.pid);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    // Update fields only if new values are provided
    const updatedFields = {
      name: name || product.name,
      slug: slugify(name || product.name),
      description: description || product.description,
      price: price || product.price,
      category: category || product.category,
      quantity: quantity || product.quantity,
      dimensions: {
        height:
          dimensions.height.value !== null
            ? dimensions.height
            : product.dimensions?.height,
        width:
          dimensions.width.value !== null
            ? dimensions.width
            : product.dimensions?.width,
        depth:
          dimensions.depth.value !== null
            ? dimensions.depth
            : product.dimensions?.depth,
      },
      weight: weight.value !== null ? weight : product.weight,
    };

    // Update product
    product = await productModel.findByIdAndUpdate(
      req.params.pid,
      updatedFields,
      { new: true }
    );

    // Handle photo update
    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();

    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).send({
      success: false,
      message: "Error updating product",
      error,
    });
  }
};

//product filer controller
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// product list base on page
export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

//searchProductController

export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

//similar product ccontroller
// similar products
export const reltedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

// get prdocyst by catgory
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

// ⭐ Add or Update Rating
export const rateProduct = async (req, res) => {
  try {
    const { productId, rating } = req.body;
    const userId = req.user._id;

    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Product ID and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // ✅ Check if the user has purchased the product
    const hasPurchased = await hasUserPurchasedProduct(userId, productId);

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: "Only users who have purchased this product can rate it.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Check if user has already rated this product
    const existingRating = product.ratings.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingRating) {
      existingRating.rating = rating; // Update existing rating
    } else {
      product.ratings.push({ user: userId, rating }); // Add new rating
    }

    await product.save(); // ✅ Save updated product

    // ✅ Calculate new average rating
    const avgRating =
      product.ratings.reduce((acc, r) => acc + r.rating, 0) /
      product.ratings.length;

    res.status(200).json({ success: true, avgRating });
  } catch (error) {
    console.error("Error rating product:", error);
    res
      .status(500)
      .json({ success: false, message: "Error submitting rating" });
  }
};

// ⭐ Get Product Rating & Average
export const getProductRating = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "ratings.user",
      "name email"
    );

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // ✅ Calculate average rating
    const avgRating =
      product.ratings.length > 0
        ? product.ratings.reduce((acc, r) => acc + r.rating, 0) /
          product.ratings.length
        : 0;

    res
      .status(200)
      .json({ success: true, ratings: product.ratings, avgRating });
  } catch (error) {
    console.error("Error fetching rating:", error);
    res.status(500).json({ success: false, message: "Error fetching rating" });
  }
};
export const addReview = async (req, res) => {
  try {
    const { productId, comment } = req.body;
    const userId = req.user._id;

    if (!productId || !comment) {
      return res.status(400).json({
        success: false,
        message: "Product ID and comment are required",
      });
    }

    // ✅ Check if the user has purchased the product
    const hasPurchased = await hasUserPurchasedProduct(userId, productId);
    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: "Only users who have purchased this product can review it.",
      });
    }

    // ✅ Fetch user details to get the correct name
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Add the review with correct user name
    const review = {
      user: userId,
      name: user.name, // ✅ Fetch user name from database
      comment: comment.trim(), // ✅ Trim extra spaces
      createdAt: new Date(),
    };

    product.reviews.push(review);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Review added successfully",
      reviews: product.reviews,
    });
  } catch (error) {
    console.error("❌ Error adding review:", error);
    res.status(500).json({ success: false, message: "Error adding review" });
  }
};

export const getReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "reviews.user",
      "name email"
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, reviews: product.reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Error fetching reviews" });
  }
};

const hasUserPurchasedProduct = async (userId, productId) => {
  const orders = await Order.find({
    userId: userId,
    "items.productId": productId, // ✅ Check if the product exists in any order
  });

  return orders.length > 0; // ✅ Returns `true` if the user has purchased the product
};

// Get latest 4 products (Featured Products)
export const getLatestProductsController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(4) // Get only 4 latest products
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).send({
      success: true,
      message: "Latest Products Fetched",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching latest products",
      error: error.message,
    });
  }
};

export const getOutOfStockProducts = async (req, res) => {
  try {
    const products = await productModel
      .find({ quantity: 0 })
      .populate("category");
    res.status(200).json({
      success: true,
      message: "Out-of-Stock Products Fetched Successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching out-of-stock products",
      error,
    });
  }
};
