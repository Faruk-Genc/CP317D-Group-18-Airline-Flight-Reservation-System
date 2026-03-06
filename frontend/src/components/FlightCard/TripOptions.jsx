import { useEffect } from "react";
import { useLang } from "../../context/LangContext";
import styles from "./TripOptions.module.css";

export default function TripOptions({
  passengers,
  travelType,
  cabinClass,
  departDate,
  returnDate,
  onChange,
  onSearch
}) {
  const { en } = useLang();

  const today = new Date().toISOString().split("T")[0];
  const oneWeekOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    onChange?.({
      passengers,
      tripType:
        travelType === "round" || travelType === "round-trip"
          ? "round-trip"
          : "one-way",
      cabinClass,
      departDate: departDate || today,
      returnDate:
        travelType === "round" || travelType === "round-trip"
          ? returnDate || oneWeekOut
          : null
    });
  }, [passengers, travelType, cabinClass, departDate, returnDate]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.options}>
        <div className={styles.row}>
          
          <div className={styles.group}>
            <label htmlFor="travelType">{en ? "Trip" : "Voyage"}</label>

            <select
              id="travelType"
              value={travelType}
              onChange={(e) => onChange({ tripType: e.target.value })}
            >
              <option value="round">{en ? "Round Trip" : "Aller-Retour"}</option>
              <option value="one-way">{en ? "One Way" : "Aller Simple"}</option>
              <option value="multi">{en ? "Multi-City" : "Multi-Villes"}</option>
            </select>
          </div>

          <div className={styles.group}>
            <label htmlFor="passengers">{en ? "Adult" : "Adulte"}</label>

            <input
              className={styles.passengerInput}
              type="number"
              id="passengers"
              min="1"
              value={passengers}
              onChange={(e) =>
                onChange({ passengers: Number(e.target.value) })
              }
            />
          </div>

          <div className={styles.group}>
            <label htmlFor="cabinClass">{en ? "Class" : "Classe"}</label>

            <select
              id="cabinClass"
              value={cabinClass}
              onChange={(e) =>
                onChange({ cabinClass: e.target.value })
              }
            >
              <option value="economy">{en ? "Economy" : "Économie"}</option>
              <option value="business">{en ? "Business" : "Affaires"}</option>
            </select>
          </div>

          <div className={styles.group}>
            <label htmlFor="departureDate">{en ? "Departure" : "Départ"}</label>

            <input
              type="date"
              id="departureDate"
              value={departDate || ""}
              onChange={(e) =>
                onChange({ departDate: e.target.value })
              }
            />
          </div>

          {(travelType === "round-trip" || travelType === "round") && (
            <div className={styles.group}>
              <label htmlFor="returnDate">
                {en ? "Arrival" : "Arrivée"}
              </label>

              <input
                type="date"
                id="returnDate"
                value={returnDate || ""}
                onChange={(e) =>
                  onChange({ returnDate: e.target.value })
                }
              />
            </div>
          )}

        </div>
      </div>

      <button
        className={styles.search}
        type="button"
        onClick={onSearch}
      >
        {en ? "Search" : "Rechercher"}
      </button>
    </div>
  );
}