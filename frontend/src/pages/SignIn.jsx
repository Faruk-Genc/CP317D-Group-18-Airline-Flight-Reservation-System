import React, { useState } from "react";
import losAngeles from "../assets/featured/losangeles.jpg";
import "./SignIn.css";

export default function SignIn({ onSignUp }) {
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
        <p className="sign-up-text">SIGN IN</p>

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

        <button className="sign-up-button" onClick={handleSubmit}>
          Sign In
        </button>

        <p className="log-in-text" onClick={onSignUp}>
          Don't have an account? <span className="log-in-here" onClick={onSignUp}>Join AeroHawk</span>
        </p>
      </div>
    </div>
  );
}