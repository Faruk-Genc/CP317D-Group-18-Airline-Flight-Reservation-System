import { useState } from "react";

export default function SearchBox({ width, height, onChange }) {
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
    onChange?.(val);
  };

  return (
    <input
      type="text"
      placeholder="Search airport, city, or country"
      value={value}
      onChange={handleChange}
      style={{
        width,
        height,
        marginTop: "2px",
        padding: "0 14px",
        fontSize: "15px",
        boxSizing: "border-box",
        borderRadius: "10px",
        border: "1.5px solid #e2e8f0",
        outline: "none",
        background: "#f8fafc",
        color: "#0f172a",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "#3b82f6";
        e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
        e.target.style.background = "#fff";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#e2e8f0";
        e.target.style.boxShadow = "none";
        e.target.style.background = "#f8fafc";
      }}
    />
  );
}