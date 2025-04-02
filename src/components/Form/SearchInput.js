import React from "react";
import { useSearch } from "../../context/search";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "../../styles/Search.css"; // Import the separated CSS file

const SearchInput = () => {
  const [values, setValues] = useSearch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (values.keyword.trim() === "") {
        navigate("/");
        return;
      }

      const { data } = await axios.get(
        `/api/v1/product/search/${values.keyword}`
      );
      setValues({ ...values, results: data });
      navigate("/search");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="input-group" style={{ maxWidth: "300px" }}>
      {" "}
      {/* ✅ Limited width */}
      <div className="form-outline" style={{ flex: "1" }}>
        <input
          type="search"
          id="form1"
          className="form-control"
          placeholder="Search"
          aria-label="Search"
          value={values.keyword}
          onChange={(e) => setValues({ ...values, keyword: e.target.value })}
          style={{
            borderRadius: "20px", // ✅ Rounded Text Box
            padding: "8px 15px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
      </div>
      <button
        type="submit"
        className="btn"
        onClick={handleSubmit}
        style={{
          backgroundColor: "rgba(129, 110, 110, 0.52)", // ✅ Change Button Background Color
          borderRadius: "50%", // ✅ Rounded Button
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          marginLeft: "8px", // ✅ Space between input and button
        }}
      >
        <FaSearch style={{ color: "rgb(252, 252, 252)", fontSize: "16px" }} />{" "}
        {/* ✅ Change Logo Color */}
      </button>
    </div>
  );
};

export default SearchInput;
