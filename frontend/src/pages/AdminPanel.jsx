import React, { useEffect } from "react";
import { useUser } from "../context/UserContext";

export default function AdminPanel({ onBack }) {
  const { user } = useUser();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      onBack?.(); 
    }
  }, [user, onBack]);

  if (!user || user.role !== "admin") {
    return null; 
  }

  return (
    <div style={{ height: "100vh" }}>
      <h1 style={{ color: "black" }}>Admin Panel</h1>
    </div>
  );
}