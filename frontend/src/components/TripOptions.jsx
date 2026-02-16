import { useState } from "react";
import "./TripOptions.css";

export default function TripOptions() {
  const [roundTrip, setRoundTrip] = useState(true);
  const [passengers, setPassengers] = useState(1);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  return (
    <div className="trip-options">
      <div className="trip-toggle">
        <label>
          <input
            type="checkbox"
            checked={roundTrip}
            onChange={() => setRoundTrip(!roundTrip)}
          />
          Round Trip
        </label>
      </div>

      <div className="date-inputs">
        <input
          type="date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
        />

        {roundTrip && (
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        )}
      </div>

      <div className="passenger-count">
        <label>Passengers:</label>
        <input
          type="number"
          min="1"
          value={passengers}
          onChange={(e) => setPassengers(e.target.value)}
        />
      </div>
    </div>
  );
}
