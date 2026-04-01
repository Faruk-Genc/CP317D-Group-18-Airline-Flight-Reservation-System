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
        padding: "8px",
        fontSize: "16px",
        boxSizing: "border-box",
        borderRadius: "4px",
        outline: "1px solid #f8b500",
        border: "none",
      }}
    />
  );
}