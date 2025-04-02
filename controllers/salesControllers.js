import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import moment from "moment";

// Enhanced Monthly Sales Report with Product Details
export const getMonthlySalesReport = async (req, res) => {
  try {
    const { month, year } = req.body;
    const startOfMonth = moment(`${year}-${month}-01`)
      .startOf("month")
      .toDate();
    const endOfMonth = moment(startOfMonth).endOf("month").toDate();

    const sales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lt: endOfMonth },
          status: { $ne: "Cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.name" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      {
        $group: {
          _id: null,
          products: { $push: "$$ROOT" },
          totalSales: { $sum: "$totalRevenue" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      products: sales[0]?.products || [],
      totalSales: sales[0]?.totalSales || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching monthly sales report",
      error,
    });
  }
};

// Enhanced Date Range Sales Report with Product Details
export const getDateRangeSalesReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    const sales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          status: { $ne: "Cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.name" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      {
        $group: {
          _id: null,
          products: { $push: "$$ROOT" },
          totalSales: { $sum: "$totalRevenue" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      products: sales[0]?.products || [],
      totalSales: sales[0]?.totalSales || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching sales report",
      error,
    });
  }
};

// Enhanced Single Date Sales Report with Product Details
export const getSingleDateSalesReport = async (req, res) => {
  try {
    const { singleDate } = req.body;
    const startDate = new Date(singleDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const sales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          status: { $ne: "Cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.name" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      {
        $group: {
          _id: null,
          products: { $push: "$$ROOT" },
          totalSales: { $sum: "$totalRevenue" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      products: sales[0]?.products || [],
      totalSales: sales[0]?.totalSales || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching single date sales report",
      error,
    });
  }
};
