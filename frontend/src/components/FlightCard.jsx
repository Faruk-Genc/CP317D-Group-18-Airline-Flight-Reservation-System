import { useState, useRef } from "react";
import { ArrowLeftRight } from "lucide-react";
import FlightCardSelection from "./FlightCardSelection";
import "./FlightCard.css";

export default function FlightCard({ iata1, city1, iata2, city2 }) {
  const [from, setFrom] = useState({ iata: iata1, city: city1 });
  const [to, setTo] = useState({ iata: iata2, city: city2 });
  const [rotated, setRotated] = useState(false);

  const swapCards = () => {
    setRotated((prev) => !prev);
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="flight-container">
      <div className="cards-wrapper">
        <Card
          iata={from.iata}
          city={from.city}
          onSelect={(o) => setFrom({ iata: o.origin_iata, city: o.origin_city })} />
        <Card
          iata={to.iata}
          city={to.city}
          onSelect={(o) => setTo({ iata: o.origin_iata, city: o.origin_city })} />
      </div>

      <button className="switch-card" onClick={swapCards}>
        <ArrowLeftRight size={24} className={rotated ? "rotated" : ""} />
      </button>
    </div>
  );
}

function Card({ iata, city, onSelect }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);

  const openDropdown = () => {
    setShowDropdown(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (origin) => {
    onSelect(origin);
    setShowDropdown(false);
  };

  return (
    <div className="flight-card" onClick={openDropdown}>
      <h1 className="iata">{iata}</h1>
      <p className="city">{city}</p>

      {showDropdown && (
        <div className="selection-overlay" onClick={(e) => e.stopPropagation()}>
          <FlightCardSelection ref={inputRef} onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
}
