import React, { useState } from "react";
import losAngeles from "../assets/featured/losangeles.jpg";
import styles from "./SignIn.module.css";
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
        setError("Username or password is incorrect");
        setLoading(false);
        return;
      }

      signIn(data.user);
      setUsername("");
      setPassword("");

      if (onSignInSuccess) {
        onSignInSuccess();
        onBack();
      }

    } catch (err) {
      setError("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={styles.page}
      style={{ backgroundImage: `url(${losAngeles})` }}
    >
      <div className={styles.container}>
        <p className={styles.title}>SIGN IN</p>

        <input
          className={styles.input}
          placeholder="User name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button
          className={styles.button}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className={styles.text}>
          Don't have an account?{" "}
          <span className={styles.link} onClick={onSignUp}>
            Join AeroHawk
          </span>
        </p>
      </div>
    </div>
  );
}