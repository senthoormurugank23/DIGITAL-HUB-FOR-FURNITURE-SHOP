import express from "express";
import {
  getMonthlySalesReport,
  getDateRangeSalesReport,
  getSingleDateSalesReport,
} from "../controllers/salesControllers.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Middleware to ensure that only admins can access
router.post("/monthly-report", requireSignIn, isAdmin, getMonthlySalesReport);
router.post(
  "/date-range-report",
  requireSignIn,
  isAdmin,
  getDateRangeSalesReport
);
router.post(
  "/single-date-report",
  requireSignIn,
  isAdmin,
  getSingleDateSalesReport
);

export default router;
