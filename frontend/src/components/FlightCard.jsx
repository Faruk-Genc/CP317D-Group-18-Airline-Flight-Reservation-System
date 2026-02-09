import { useState, useRef } from "react";
import { ArrowLeftRight } from "lucide-react";
import FlightCardSelection from "./FlightCardSelection";
import "./FlightCard.css";

export default function FlightCard({ aita1, city1, aita2, city2 }) {
  const [swapped, setSwapped] = useState(false);
  const [from, setFrom] = useState({ aita: aita1, city: city1 });
  const [to, setTo] = useState({ aita: aita2, city: city2 });

  const swapCards = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="flight-container">
      <Card aita={from.aita} city={from.city} onSelect={(o) => setFrom({ aita: o.origin_iata, city: o.origin_city })} />
      <Card aita={to.aita} city={to.city} onSelect={(o) => setTo({ aita: o.origin_iata, city: o.origin_city })} />

      <button className="switch-card" onClick={swapCards}>
        <ArrowLeftRight size={24} />
      </button>
    </div>
  );
}

function Card({ aita, city, onSelect }) {
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
      <h1 className="aita">{aita}</h1>
      <p>{city}</p>

      {showDropdown && (
        <div className="selection-overlay" onClick={(e) => e.stopPropagation()}>
          <FlightCardSelection ref={inputRef} onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
}