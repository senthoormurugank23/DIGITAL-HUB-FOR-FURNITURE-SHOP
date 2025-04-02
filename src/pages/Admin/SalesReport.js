import React, { useState } from "react";
import Layout from "../../components/Layout/Layout";
import axios from "axios";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/SalesReport.css";
import AdminMenu from "../../components/Layout/AdminMenu";

const SalesReport = () => {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [singleDate, setSingleDate] = useState("");
  const [monthlySales, setMonthlySales] = useState(null);
  const [dateRangeSales, setDateRangeSales] = useState(null);
  const [singleDateSales, setSingleDateSales] = useState(null);
  const [productDetails, setProductDetails] = useState([]);

  // Handle Monthly Report
  const handleMonthlyReport = async () => {
    try {
      const response = await axios.post("/api/v1/sales/monthly-report", {
        month,
        year,
      });
      setMonthlySales(response.data.totalSales);
      setProductDetails(response.data.products);
    } catch (error) {
      toast.error("Failed to fetch monthly sales report");
    }
  };

  // Handle Date Range Report
  const handleDateRangeReport = async () => {
    try {
      const response = await axios.post("/api/v1/sales/date-range-report", {
        fromDate,
        toDate,
      });
      setDateRangeSales(response.data.totalSales);
      setProductDetails(response.data.products);
    } catch (error) {
      toast.error("Failed to fetch sales report for the date range");
    }
  };

  // Handle Single Date Report
  const handleSingleDateReport = async () => {
    try {
      const response = await axios.post("/api/v1/sales/single-date-report", {
        singleDate,
      });
      setSingleDateSales(response.data.totalSales);
      setProductDetails(response.data.products);
    } catch (error) {
      toast.error("Failed to fetch sales report for the selected date");
    }
  };

  // Function to generate and download PDF
  const generatePDF = () => {
    const doc = new jsPDF();

    // Add logo and title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.text("SAP FURNITURES", 105, 20, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text("SALES REPORT", 105, 30, { align: "center" });

    // Add report period information
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    let reportTitle = "";
    if (monthlySales !== null) {
      reportTitle = `Monthly Report: ${month}/${year}`;
    } else if (dateRangeSales !== null) {
      reportTitle = `Date Range: ${fromDate} to ${toDate}`;
    } else if (singleDateSales !== null) {
      reportTitle = `Daily Report: ${singleDate}`;
    }

    doc.text(reportTitle, 105, 40, { align: "center" });

    // Add generated date
    const generatedDate = new Date().toLocaleString();
    doc.text(`Generated on: ${generatedDate}`, 105, 48, { align: "center" });

    // Add a line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 55, 190, 55);

    // Prepare product data for the table
    const tableData = productDetails.map((product) => [
      product.productName,
      product.totalQuantity,
      `₹${product.totalRevenue.toLocaleString("en-IN")}`,
    ]);

    // Add total row
    const totalSales = monthlySales || dateRangeSales || singleDateSales;
    const totalQuantity = productDetails.reduce(
      (sum, product) => sum + product.totalQuantity,
      0
    );
    const totalRevenue = productDetails.reduce(
      (sum, product) => sum + product.totalRevenue,
      0
    );

    tableData.push([
      { content: "TOTAL", styles: { fontStyle: "bold" } },
      { content: totalQuantity, styles: { fontStyle: "bold" } },
      {
        content: `₹${totalRevenue.toLocaleString("en-IN")}`,
        styles: { fontStyle: "bold" },
      },
    ]);

    // Add the product table using autoTable
    autoTable(doc, {
      startY: 60,
      head: [["Product Name", "Quantity Sold", "Revenue"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [64, 64, 64],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: "auto", halign: "center" },
        2: { cellWidth: "auto", halign: "right" },
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: "linebreak",
      },
      margin: { left: 20, right: 20 },
    });

    // Add summary section
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("SUMMARY", 20, finalY);

    doc.setFont("helvetica", "normal");
    doc.text(`Total Products Sold: ${totalQuantity}`, 20, finalY + 10);
    doc.text(
      `Total Revenue: ₹${totalSales.toLocaleString("en-IN")}`,
      20,
      finalY + 20
    );

    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("© SAP Furnitures - Confidential Report", 105, 285, {
      align: "center",
    });

    doc.save(`SAP_Furnitures_Sales_Report_${new Date().getTime()}.pdf`);
  };

  return (
    <Layout>
      <AdminMenu />
      <div className="custom-sales-report-container">
        <h1 className="text-center mb-4">Sales Report</h1>

        {/* Input Fields */}
        <div className="input-row1">
          <div className="input-group1">
            <label>Monthly Report</label>
            <input
              type="month"
              value={`${year}-${month}`}
              onChange={(e) => {
                const [selectedYear, selectedMonth] = e.target.value.split("-");
                setYear(selectedYear);
                setMonth(selectedMonth);
              }}
            />
            <button onClick={handleMonthlyReport}>Get Monthly Report</button>
          </div>

          <div className="input-group1">
            <label>Date Range Report</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <button onClick={handleDateRangeReport}>
              Get Date Range Report
            </button>
          </div>

          <div className="input-group1">
            <label>Single Date Report</label>
            <input
              type="date"
              value={singleDate}
              onChange={(e) => setSingleDate(e.target.value)}
            />
            <button onClick={handleSingleDateReport}>
              Get Single Date Report
            </button>
          </div>
        </div>

        {/* Display Results */}
        <div className="results-section">
          {monthlySales !== null && (
            <div className="sales-report-result">
              <h4>
                Total Sales for {month}/{year}: ₹
                {monthlySales.toLocaleString("en-IN")}
              </h4>
            </div>
          )}

          {dateRangeSales !== null && (
            <div className="sales-report-result">
              <h4>
                Total Sales from {fromDate} to {toDate}: ₹
                {dateRangeSales.toLocaleString("en-IN")}
              </h4>
            </div>
          )}

          {singleDateSales !== null && (
            <div className="sales-report-result">
              <h4>
                Total Sales for {singleDate}: ₹
                {singleDateSales.toLocaleString("en-IN")}
              </h4>
            </div>
          )}

          {/* Product Details Table */}
          {productDetails.length > 0 && (
            <div className="product-details-table mt-4">
              <h4>Product-wise Sales Details</h4>
              <table className="table table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>Product Name</th>
                    <th className="text-center">Quantity Sold</th>
                    <th className="text-end">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody>
                  {productDetails.map((product, index) => (
                    <tr key={index}>
                      <td>{product.productName}</td>
                      <td className="text-center">{product.totalQuantity}</td>
                      <td className="text-end">
                        ₹{product.totalRevenue.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                  <tr className="table-active">
                    <td>
                      <strong>TOTAL</strong>
                    </td>
                    <td className="text-center">
                      <strong>
                        {productDetails.reduce(
                          (sum, product) => sum + product.totalQuantity,
                          0
                        )}
                      </strong>
                    </td>
                    <td className="text-end">
                      <strong>
                        ₹
                        {(
                          monthlySales ||
                          dateRangeSales ||
                          singleDateSales
                        ).toLocaleString("en-IN")}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Download PDF Button */}
        {(monthlySales !== null ||
          dateRangeSales !== null ||
          singleDateSales !== null) && (
          <div className="download-section">
            <button onClick={generatePDF} className="btn btn-primary">
              Download Detailed Report as PDF
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SalesReport;
