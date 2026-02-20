import { useState } from "react";
import "./TripOptions.css";

export default function TripOptions() {
  const [travelType, setTravelType] = useState("round");
  const [passengers, setPassengers] = useState(1);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  return (
    <div className="trip-options">
      <div className="trip-options-label">
        <div>Trip </div>
        <div>Depature</div>
        <div>Arrival</div>
        <div>Passengers</div>
      </div>

      <div className="trip-toggle">
        <select
          className="travel-type"
          value={travelType}
          onChange={(e) => setTravelType(e.target.value)}
        >
          <option value="round">Round Trip</option>
          <option value="oneway">One Way</option>
          <option value="multi">Multi-City</option>
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
        <label htmlFor="passengers">Adult:</label>
        <input
          type="number"
          id="passengers"
          min="1"
          value={passengers}
          onChange={(e) => setPassengers(e.target.value)}
        />
      </div>
    </div>
  );
}