import { useState, useEffect, useRef } from "react";
import { useLang } from "../../context/LangContext";
import "./TripOptions.css";

export default function TripOptions() {
  const { en } = useLang(); 
  const [travelType, setTravelType] = useState("round");
  const [passengers, setPassengers] = useState(1);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const labelRef = useRef(null);

  useEffect(() => {
    if (labelRef.current) {
      const arrivalLabel = labelRef.current.children[2];
      if (travelType === "round") {
        arrivalLabel.style.color = "";
        arrivalLabel.style.userSelect = "";
      } else {
        arrivalLabel.style.color = "transparent";
        arrivalLabel.style.userSelect = "none";
      }
    }
  }, [travelType]);

  return (
    <div className="trip-options-wrapper">
      <div className="trip-options">
        <div className={`trip-options-label ${en ? "" : "french"}`} ref={labelRef}>
          <div>{en ? "Trip" : "Voyage"}</div>
          <div>{en ? "Departure" : "Départ"}</div>
          <div>{en ? "Arrival" : "Arrivée"}</div>
          <div>{en ? "Passengers" : "Passagers"}</div>
        </div>

        <div className="trip-toggle">
          <select
            className="travel-type"
            value={travelType}
            onChange={(e) => setTravelType(e.target.value)}
          >
            <option value="round">{en ? "Round Trip" : "Aller-Retour"}</option>
            <option value="oneway">{en ? "One Way" : "Aller Simple"}</option>
            <option value="multi">{en ? "Multi-City" : "Multi-Villes"}</option>
          </select>
        </div>

        <div className="date-inputs">
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
          />
          {travelType === "round" && (
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          )}
        </div>

        <div className="passenger-wrapper">
          <label htmlFor="passengers">{en ? "Adult:" : "Adulte:"}</label>
          <input
            type="number"
            id="passengers"
            min="1"
            value={passengers}
            onChange={(e) => setPassengers(e.target.value)}
          />
        </div>
      </div>

      <div className="trip-options-search">
        {en ? "Search" : "Rechercher"}
      </div>
    </div>
  );
}