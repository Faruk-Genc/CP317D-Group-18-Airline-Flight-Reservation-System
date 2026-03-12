import React, { useState } from "react";
import losAngeles from "../assets/featured/losangeles.jpg";
import "./SignIn.css";
import { useUser } from "../context/UserContext";

export default function SignUp({ onBack, onSignUpSuccess }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useUser();

  async function handleSubmit() {
    setLoading(true);
    const userData = {
      username,
      email,
      password,
      confirmPassword,
      phone_number: phone,
      forename: firstName,
      surname: lastName,
      street,
      city,
      province,
      postal_code: postalCode,
      country,
    };

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Signup errors: " + JSON.stringify(data.errors));
        setLoading(false);
        return;
      }

      const loginRes = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok || !loginData.success) {
        alert("Signup succeeded but auto login failed: " + JSON.stringify(loginData.errors));
        setLoading(false);
        return;
      }

      signIn(loginData.user);
      console.log("Signed-in user info:", loginData.user);

      setFirstName(""); setLastName(""); setUsername(""); setPassword(""); setConfirmPassword("");
      setEmail(""); setPhone(""); setStreet(""); setCity(""); setProvince(""); setPostalCode(""); setCountry("");

      if (onSignUpSuccess) {
        onSignUpSuccess();
        onBack();
      }

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-page" style={{ backgroundImage: `url(${losAngeles})` }}>
      <div className="main-box-container">
        <p className="sign-up-text">SIGN UP</p>

        <input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value.replace(/[^a-zA-Z]/g, ""))} />
        <input placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value.replace(/[^a-zA-Z]/g, ""))} />
        <input placeholder="User name" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))} />
        <input placeholder="Street Address" value={street} onChange={e => setStreet(e.target.value)} />
        <input placeholder="City" value={city} onChange={e => setCity(e.target.value.replace(/[^a-zA-Z]/g, ""))} />
        <input placeholder="Province" value={province} onChange={e => setProvince(e.target.value.replace(/[^a-zA-Z]/g, ""))} />
        <input placeholder="Postal Code" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
        <input placeholder="Country" value={country} onChange={e => setCountry(e.target.value.replace(/[^a-zA-Z]/g, ""))} />

        <button className="sign-up-button" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </div>
    </div>
  );
}