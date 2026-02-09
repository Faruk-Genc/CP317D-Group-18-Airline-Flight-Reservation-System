import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import "./FlightCard.css";

import FlightCardSelection from "./FlightCardSelection";

export default function FlightCard({ aita1, city1, aita2, city2 }) {
  const [swapped, setSwapped] = useState(false);

  const from = swapped
    ? { aita: aita2, city: city2 }
    : { aita: aita1, city: city1 };

  const to = swapped
    ? { aita: aita1, city: city1 }
    : { aita: aita2, city: city2 };

  return (
    <div className="flight-container">
      <Card aita={from.aita} city={from.city} />
      <Card aita={to.aita} city={to.city} />

      <button
        className="switch-card"
        onClick={() => setSwapped((s) => !s)}
      >
        <ArrowLeftRight
          size={24}
          className={swapped ? "rotated" : ""}
        />
      </button>
    </div>
  );
}

function Card({ aita, city }) {
  return (
    <div className="flight-card">
      <h1 className="aita">{aita}</h1>
      <p>{city}</p>

      {/* hover overlay */}
      <div className="selection-overlay">
        <FlightCardSelection />
      </div>
    </div>
  );
}