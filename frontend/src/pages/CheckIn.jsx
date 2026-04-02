import React, { useState } from "react";
import styles from "./CheckIn.module.css";
import { useLang } from "../context/LangContext";

function CheckIn() {
  const { en } = useLang();

  const [reference, setReference] = useState("");
  const [lastName, setLastName] = useState("");
  const [booking, setBooking] = useState(null); 
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!reference || !lastName) {
      setError("Missing input");
      return;
    }

    try {
      setError("");

      const res = await fetch(
        `http://127.0.0.1:5000/api/checkin?booking_id=${reference}&last_name=${lastName}`
      );

      const data = await res.json();

      if (!res.ok) {
        setBooking(null);
        setError(data.error || "Error");
        return;
      }

      setBooking(data); 

    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <div>
      <div className={styles.mainContainer}>
        <div
          className={`${styles.panel} ${
            booking ? styles.panelExpanded : ""
          }`}
        >
          <div className={styles.headerRow}>
            <h1 className={styles.title}>
              {en ? "Check In" : "Check-in"}
            </h1>
            <p className={styles.subtitle}>
              {en
                ? "Check-in is available starting 24 hours before your scheduled departure."
                : "Le check-in est disponible à partir de 24 heures avant votre départ prévue."}
            </p>
          </div>

          <div className={styles.inputContainer}>
            <div className={styles.fieldBlock}>
              <label className={styles.fieldLabel}>
                {en
                  ? "Booking Reference"
                  : "Référence de réservation"}
              </label>

              <input
                type="text"
                className={styles.searchInput}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className={styles.fieldBlock}>
              <label className={styles.fieldLabel}>
                {en ? "Last Name" : "Nom de famille"}
              </label>

              <input
                type="text"
                className={styles.searchInput}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.searchWrap}>
            <button
              type="button"
              className={styles.searchBtn}
              onClick={handleSearch}
            >
              {en ? "Search" : "Rechercher"}
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {booking && (
            <div className={styles.resultCard}>
              <h6>TEMPORARY placeholder</h6>
              <h2>{booking.forename} {booking.surname}</h2>

              <p><b>Flight:</b> {booking.departing_flight_no}</p>
              <p><b>From:</b> {booking.origin_city} ({booking.origin_iata})</p>
              <p><b>To:</b> {booking.destination_city} ({booking.destination_iata})</p>

              <p><b>Departure:</b> {new Date(booking.departure_time).toLocaleString()}</p>
              <p><b>Arrival:</b> {new Date(booking.arrival_time).toLocaleString()}</p>

              <p><b>Aircraft:</b> {booking.aircraft}</p>
              <p><b>Airline:</b> {booking.airline}</p>

              <p><b>Cabin:</b> {booking.cabin_type}</p>
              <p><b>Passengers:</b> {booking.passengers}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckIn;