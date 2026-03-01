import { useEffect } from "react";
import { useLang } from "../../context/LangContext";
import "./TripOptions.css";

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

  // 🔁 Sync normalized data upward (keeps your original behavior)
  useEffect(() => {
    onChange?.({
      passengers,
      tripType:
        travelType === "round" || travelType === "round-trip"
          ? "round-trip"
          : travelType === "oneway"
          ? "one-way"
          : travelType,
      cabinClass,
      departDate: departDate || null,
      returnDate:
        travelType === "round-trip" || travelType === "round"
          ? returnDate || null
          : null,
    });
  }, [passengers, travelType, cabinClass, departDate, returnDate]);

  return (
    <div className="trip-options-wrapper">
      <div className="trip-options">
        <div className="top-row">

          {/* TRIP TYPE */}
          <div className="field-group">
            <label htmlFor="travelType">
              {en ? "Trip" : "Voyage"}
            </label>
            <select
              id="travelType"
              value={travelType}
              onChange={(e) =>
                onChange({ travelType: e.target.value })
              }
            >
              <option value="round">
                {en ? "Round Trip" : "Aller-Retour"}
              </option>
              <option value="oneway">
                {en ? "One Way" : "Aller Simple"}
              </option>
              <option value="multi">
                {en ? "Multi-City" : "Multi-Villes"}
              </option>
            </select>
          </div>

          {/* PASSENGERS */}
          <div className="field-group">
            <label htmlFor="passengers">
              {en ? "Adult" : "Adulte"}
            </label>
            <input
              type="number"
              id="passengers"
              min="1"
              value={passengers}
              onChange={(e) =>
                onChange({
                  passengers: Number(e.target.value),
                })
              }
            />
          </div>

          {/* CABIN CLASS */}
          <div className="field-group">
            <label htmlFor="cabinClass">
              {en ? "Class" : "Classe"}
            </label>
            <select
              id="cabinClass"
              value={cabinClass}
              onChange={(e) =>
                onChange({ cabinClass: e.target.value })
              }
            >
              <option value="economy">
                {en ? "Economy" : "Économie"}
              </option>
              <option value="business">
                {en ? "Business" : "Affaires"}
              </option>
            </select>
          </div>

          {/* DEPARTURE DATE */}
          <div className="field-group">
            <label htmlFor="departureDate">
              {en ? "Departure" : "Départ"}
            </label>
            <input
              type="date"
              id="departureDate"
              value={departDate || ""}
              onChange={(e) =>
                onChange({
                  departDate: e.target.value,
                })
              }
            />
          </div>

          {/* RETURN DATE (ONLY IF ROUND) */}
          {(travelType === "round-trip" ||
            travelType === "round") && (
            <div className="field-group">
              <label htmlFor="returnDate">
                {en ? "Arrival" : "Arrivée"}
              </label>
              <input
                type="date"
                id="returnDate"
                value={returnDate || ""}
                onChange={(e) =>
                  onChange({
                    returnDate: e.target.value,
                  })
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* SEARCH BUTTON */}
      <button
        className="trip-options-search"
        type="button"
        onClick={onSearch}
      >
        {en ? "Search" : "Rechercher"}
      </button>
    </div>
  );
}