import React, { useState } from "react";
import losAngeles from "../assets/featured/losangeles.jpg";
import styles from "./SignUp.module.css";
import { useUser } from "../context/UserContext";

function Field({ placeholder, value, onChange, type = "text", error }) {
  return (
    <div className={styles.field}>
      <div className={styles.errorText}>{error || ""}</div>
      <input
        className={styles.input}
        placeholder={placeholder}
        value={value}
        type={type}
        onChange={onChange}
      />
    </div>
  );
}

export default function SignUp({ onBack, onSignUpSuccess }) {
  const { signIn } = useUser();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: ""
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    const newErrors = {};

    if (!form.firstName) newErrors.forename = "Field cannot be empty";
    if (!form.lastName) newErrors.surname = "Field cannot be empty";
    if (!form.username) newErrors.username = "Field cannot be empty";
    if (!form.password) newErrors.password = "Field cannot be empty";
    if (!form.confirmPassword) newErrors.confirmPassword = "Field cannot be empty";
    if (!form.email) newErrors.email = "Field cannot be empty";
    if (!form.phone) newErrors.phone = "Field cannot be empty";
    if (!form.street) newErrors.street = "Field cannot be empty";
    if (!form.city) newErrors.city = "Field cannot be empty";
    if (!form.province) newErrors.province = "Field cannot be empty";
    if (!form.postalCode) newErrors.postal_code = "Field cannot be empty";
    if (!form.country) newErrors.country = "Field cannot be empty";

    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    const userData = {
      username: form.username,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      phone_number: form.phone,
      forename: form.firstName,
      surname: form.lastName,
      street: form.street,
      city: form.city,
      province: form.province,
      postal_code: form.postalCode,
      country: form.country
    };

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (!data.success) {
        const mappedErrors = {};
        if (data.errors.username) mappedErrors.username = data.errors.username;
        if (data.errors.email) mappedErrors.email = data.errors.email;
        if (data.errors.phone_number) mappedErrors.phone = data.errors.phone_number; 
        setFieldErrors(mappedErrors);
        setLoading(false);
        return;
      }

      const loginRes = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password
        })
      });

      const loginData = await loginRes.json();

      if (!loginData.success) {
        setFieldErrors({ general: "Account created but login failed" });
        setLoading(false);
        return;
      }

      signIn(loginData.user);

      if (onSignUpSuccess) {
        onSignUpSuccess();
        onBack();
      }
    } catch (err) {
      setFieldErrors({ general: "Something went wrong." });
    }

    setLoading(false);
  }

  return (
    <div
      className={styles.page}
      style={{ backgroundImage: `url(${losAngeles})` }}
    >
      <div className={styles.container}>
        <p className={styles.title}>SIGN UP</p>

        <Field
          placeholder="First name"
          value={form.firstName}
          error={fieldErrors.forename}
          onChange={(e) =>
            updateField("firstName", e.target.value.replace(/[^a-zA-Z]/g, ""))
          }
        />

        <Field
          placeholder="Last name"
          value={form.lastName}
          error={fieldErrors.surname}
          onChange={(e) =>
            updateField("lastName", e.target.value.replace(/[^a-zA-Z]/g, ""))
          }
        />

        <Field
          placeholder="User name"
          value={form.username}
          error={fieldErrors.username}
          onChange={(e) => updateField("username", e.target.value)}
        />

        <Field
          placeholder="Email"
          value={form.email}
          error={fieldErrors.email}
          onChange={(e) => updateField("email", e.target.value)}
        />

        <Field
          placeholder="Password"
          type="password"
          value={form.password}
          error={fieldErrors.password}
          onChange={(e) => updateField("password", e.target.value)}
        />

        <Field
          placeholder="Confirm Password"
          type="password"
          value={form.confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
        />

        <Field
          placeholder="Phone Number"
          value={form.phone}
          error={fieldErrors.phone}
          onChange={(e) =>
            updateField(
              "phone",
              e.target.value.replace(/[^0-9]/g, "").slice(0, 15)
            )
          }
        />

         <Field
          placeholder="Country"
          value={form.country}
          error={fieldErrors.country}
          onChange={(e) =>
            updateField("country", e.target.value.replace(/[^a-zA-Z]/g, ""))
          }
        />

        <Field
          placeholder="Street Address"
          value={form.street}
          error={fieldErrors.street}
          onChange={(e) => updateField("street", e.target.value)}
        />

        <Field
          placeholder="City"
          value={form.city}
          error={fieldErrors.city}
          onChange={(e) =>
            updateField("city", e.target.value.replace(/[^a-zA-Z]/g, ""))
          }
        />

        <Field
          placeholder="Province"
          value={form.province}
          error={fieldErrors.province}
          onChange={(e) =>
            updateField("province", e.target.value.replace(/[^a-zA-Z]/g, ""))
          }
        />

        <Field
          placeholder="Postal Code"
          value={form.postalCode}
          error={fieldErrors.postal_code}
          onChange={(e) => updateField("postalCode", e.target.value)}
        />

        <button
          className={styles.button}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </div>
    </div>
  );
}