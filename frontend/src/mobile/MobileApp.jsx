import React, { useRef } from "react";
import Navbar from "./components/Navbar/Navbar.jsx";
import styles from "./MobileApp.module.css";

export default function MobileApp() {
  const fileInputRef = useRef(null);

  const openCamera = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Captured file:", file);
      alert(`Captured file: ${file.name}`);
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <h1 className={styles.title}>Mobile App</h1>

      <div className={styles.menu}>
        <p>Flight Status</p>
        <p>Check In</p>
        <p>My Flights</p>
      </div>

      <div className={styles.cameraContainer}>
        <button className={styles.cameraButton} onClick={openCamera}>
          Scan QR / Open Camera
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className={styles.hiddenInput}
          onChange={handleCapture}
        />
      </div>
    </div>
  );
}