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
  onSearch,
}) {
  const { en } = useLang();

  useEffect(() => {
    onChange?.({
      passengers,
      tripType: travelType,
      cabinClass,
      departDate: departDate || null,
      returnDate:
        travelType === "round-trip"
          ? returnDate || null
          : null,
    });
  }, [passengers, travelType, cabinClass, departDate, returnDate]);

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.options}>
          <div className={styles.row}>

            <div className={styles.group}>
              <label htmlFor="travelType">{en ? "Trip" : "Voyage"}</label>
              <select
                id="travelType"
                value={travelType}
                onChange={(e) =>
                  onChange({ tripType: e.target.value })
                }
              >
              <option value="round-trip">
                  {en ? "Round Trip" : "Aller-Retour"}
                </option>
                <option value="one-way">
                  {en ? "One Way" : "Aller Simple"}
                </option>
                <option value="multi">
                  {en ? "Multi-City" : "Multi-Villes"}
                </option>
              </select>
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
              <label htmlFor="passengers">{en ? "Adult" : "Adulte"}</label>
              <input
                className={styles.passengerInput}
                type="number"
                id="passengers"
                min="1"
                max="9"
                value={passengers}
                onChange={(e) =>
                  onChange({ passengers: Number(e.target.value) })
                }
              />
            </div>

            <div
            className={styles.group}
            style={{
              width:
                travelType === "round-trip" || travelType === "round"
                  ? "150px" 
                  : "300px", 
            }}
          >
            <label htmlFor="departureDate">{en ? "Departure" : "Départ"}</label>
            <input
              type="date"
              id="departureDate"
              value={departDate || ""}
              onChange={(e) => onChange({ departDate: e.target.value })}
            />
          </div>

            {(travelType === "round-trip" || travelType === "round") && (
              <div className={styles.group}>
                <label htmlFor="returnDate">{en ? "Return" : "Retour"}</label>
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
      </div>

      <button
        className={styles.search}
        type="button"
        onClick={onSearch}
      >
        {en ? "Search" : "Rechercher"}
      </button>
    </>
  );
}