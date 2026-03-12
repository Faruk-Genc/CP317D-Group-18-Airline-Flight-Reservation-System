import React, { useState } from "react";
import losAngeles from "../assets/featured/losangeles.jpg";
import "./SignIn.css";
import { useUser } from "../context/UserContext";

export default function SignIn({ onSignUp, onSignInSuccess, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useUser();

  async function handleSubmit() {
    setError("");
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert("Sign-in failed: " + JSON.stringify(data.errors || "Unknown error"));
        setLoading(false);
        return;
      }

      signIn(data.user);

      console.log(data.user);

      setUsername("");
      setPassword("");

      if (onSignInSuccess) {
        onSignInSuccess();
        onBack();
      }

    } catch (err) {
      alert("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
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

        {error && <p className="error-text">{error}</p>}

        <button
          className="sign-up-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="log-in-text">
          Don't have an account?{" "}
          <span className="log-in-here" onClick={onSignUp}>
            Join AeroHawk
          </span>
        </p>
      </div>
    </div>
  );
}