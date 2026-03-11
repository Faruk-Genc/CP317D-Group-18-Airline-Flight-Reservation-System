import React, { useState } from "react";
import losAngeles from "../assets/featured/losangeles.jpg";
import "./SignIn.css";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSubmit() {
    console.log("Username:", username);
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);

    setUsername("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div
      className="signup-page"
      style={{ backgroundImage: `url(${losAngeles})` }}
    >
      <div className="main-box-container">
        <p className="sign-up-text">SIGN UP</p>

        <input
          placeholder="User name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button className="sign-up-button" onClick={handleSubmit}>
          Sign Up
        </button>

        <p className="log-in-text">
          Already have an account? <span className="log-in-here">Log in here</span>
        </p>
      </div>
    </div>
  );
}