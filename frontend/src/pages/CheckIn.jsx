import React, { useState } from "react";
import styles from "./CheckIn.module.css";
import { useLang } from "../context/LangContext";

function CheckIn() {
  const { en } = useLang();

  return (
    <div>
      <div className={styles.mainContainer}>
        <div className={styles.panel}>
          <div className={styles.headerRow}>
            <h1 className={styles.title}>
              {en ? "Check In" : "Check-in"}
            </h1>
            <p className={styles.subtitle}>
              {en ? "Check-in is available starting 24 hours before your scheduled departure." : "Le check-in est disponible à partir de 24 heures avant votre départ prévue."}
            </p>
          </div>
          <div className={styles.inputContainer}>
            <div className={styles.fieldBlock}>
              <label className={styles.fieldLabel}>
                {en ? "Booking Reference or Flight Number" : "Référence de réservation ou numéro de vol"}
              </label>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={en ? "Booking reference / Flight number" : "Référence de réservation / Numéro de vol"}
              />
            </div>

            <div className={styles.fieldBlock}>
              <label className={styles.fieldLabel}>
                {en ? "Last Name" : "Nom de famille"}
              </label>

              <input
                type="text"
                className={styles.searchInput}
                placeholder={en ? "Last name" : "Nom de famille"}
              />
            </div>
          </div>

          <div className={styles.searchWrap}>
            <button
              type="button"
              className={styles.searchBtn}
            >
              {en ? "Search" : "Rechercher"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckIn;
