import React, { useState } from "react";
import losAngeles from "../assets/featured/clouds.jpg";
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

function capitalizeFirstLetter(input) {
  if (!input) return "";
  return input
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map((sub) =>
          sub
            .split("'")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("'")
        )
        .join("-")
    )
    .join(" ");
}

function isValidName(name) {
  const regex = /^(?!.*[-']{2})[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
  return regex.test(name);
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
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
    country: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    const newErrors = {};

    if (!form.firstName) newErrors.forename = "Field cannot be empty";
    else if (!isValidName(form.firstName)) newErrors.forename = "Invalid first name";

    if (!form.lastName) newErrors.surname = "Field cannot be empty";
    else if (!isValidName(form.lastName)) newErrors.surname = "Invalid last name";

    if (!form.country) newErrors.country = "Field cannot be empty";
    else if (!isValidName(form.country)) newErrors.country = "Invalid country";

    if (!form.province) newErrors.province = "Field cannot be empty";
    else if (!isValidName(form.province)) newErrors.province = "Invalid province";

    if (!form.city) newErrors.city = "Field cannot be empty";
    else if (!isValidName(form.city)) newErrors.city = "Invalid city";

    if (!form.username) newErrors.username = "Field cannot be empty";
    else if (form.username.length < 4 || form.username.length > 20)
      newErrors.username = "Username must be 4-20 characters";

    if (!form.password) newErrors.password = "Field cannot be empty";
    else if (/\s/.test(form.password))
      newErrors.password = "Password cannot contain spaces";

    if (!form.confirmPassword) newErrors.confirmPassword = "Field cannot be empty";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!form.email) newErrors.email = "Field cannot be empty";
    else if (!isValidEmail(form.email)) newErrors.email = "Invalid email address";

    if (!form.phone) newErrors.phone = "Field cannot be empty";
    if (!form.street) newErrors.street = "Field cannot be empty";
    if (!form.postalCode) newErrors.postal_code = "Field cannot be empty";

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
      country: form.country,
    };

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
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
          password: form.password,
        }),
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
            updateField("firstName", capitalizeFirstLetter(e.target.value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s'-]/g, "")))
          }
        />

        <Field
          placeholder="Last name"
          value={form.lastName}
          error={fieldErrors.surname}
          onChange={(e) =>
            updateField("lastName", capitalizeFirstLetter(e.target.value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s'-]/g, "")))
          }
        />

        <Field
          placeholder="User name"
          value={form.username}
          error={fieldErrors.username}
          onChange={(e) =>
            updateField(
              "username",
              e.target.value.replace(/[^a-zA-Z0-9._ -]/g, "").slice(0, 20)
            )
          }
        />

        <Field
          placeholder="Email"
          type="email"
          value={form.email}
          error={fieldErrors.email}
          onChange={(e) => updateField("email", e.target.value)}
        />

        <Field
          placeholder="Password"
          type="password"
          value={form.password}
          error={fieldErrors.password}
          onChange={(e) =>
            updateField("password", e.target.value.replace(/\s/g, ""))
          }
        />

        <Field
          placeholder="Confirm Password"
          type="password"
          value={form.confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={(e) =>
            updateField("confirmPassword", e.target.value.replace(/\s/g, ""))
          }
        />

        <Field
          placeholder="Phone Number"
          value={form.phone}
          error={fieldErrors.phone}
          onChange={(e) =>
            updateField("phone", e.target.value.replace(/[^0-9]/g, "").slice(0, 15))
          }
        />

        <Field
          placeholder="Country"
          value={form.country}
          error={fieldErrors.country}
          onChange={(e) =>
            updateField("country", capitalizeFirstLetter(e.target.value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s'-]/g, "")))
          }
        />

        <Field
          placeholder="Street Address"
          value={form.street}
          error={fieldErrors.street}
          onChange={(e) =>
            updateField("street", capitalizeFirstLetter(e.target.value.replace(/[^a-zA-Z0-9\s.,'-]/g, "")))
          }
        />

        <Field
          placeholder="City"
          value={form.city}
          error={fieldErrors.city}
          onChange={(e) =>
            updateField("city", capitalizeFirstLetter(e.target.value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s'-]/g, "")))
          }
        />

        <Field
          placeholder="Province"
          value={form.province}
          error={fieldErrors.province}
          onChange={(e) =>
            updateField("province", capitalizeFirstLetter(e.target.value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s'-]/g, "")))
          }
        />

        <Field
          placeholder="Postal Code"
          value={form.postalCode}
          error={fieldErrors.postal_code}
          onChange={(e) =>
            updateField("postalCode", e.target.value.replace(/[^a-zA-Z0-9\s]/g, "").toUpperCase())
          }
        />

        <button
          className={styles.button}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        {fieldErrors.general && (
          <div className={styles.errorText}>{fieldErrors.general}</div>
        )}
      </div>
    </div>
  );
}