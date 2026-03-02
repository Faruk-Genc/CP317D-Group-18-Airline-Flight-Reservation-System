import { useState, useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";
import FlightCardSelection from "./FlightCardSelection";
import "./FlightCard.css";

export default function FlightCard({ iata1, city1, iata2, city2, onChange }) {
  const [from, setFrom] = useState({
    iata: iata1 || "",
    city: city1 || "",
    isCountry: false,
    origin_country: "",
  });
  const [to, setTo] = useState({
    iata: iata2 || "",
    city: city2 || "",
    isCountry: false,
    origin_country: "",
  });
  const [rotated, setRotated] = useState(false);

  useEffect(() => {
    onChange?.({ from, to });
  }, [from, to]);

  const swapCards = () => {
    setRotated((prev) => !prev);
    setFrom((prevFrom) => {
      setTo(prevFrom);
      return to;
    });
  };

  return (
    <div className="flight-container">
      <div className="cards-wrapper">
        <Card
          iata={from.iata}
          city={from.city}
          isCountry={from.isCountry}
          country={from.origin_country}
          onSelect={(o) =>
            setFrom({
              iata: o.origin_iata,
              city: o.origin_city,
              isCountry: o.isCountry,
              origin_country: o.origin_country,
            })
          }
        />

        <Card
          iata={to.iata}
          city={to.city}
          isCountry={to.isCountry}
          country={to.origin_country}
          onSelect={(o) =>
            setTo({
              iata: o.origin_iata,
              city: o.origin_city,
              isCountry: o.isCountry,
              origin_country: o.origin_country,
            })
          }
        />
      </div>

      <button className="switch-card" onClick={swapCards}>
        <ArrowLeftRight size={24} className={rotated ? "rotated" : ""} />
      </button>
    </div>
  );
}

function Card({ iata, city, onSelect, isCountry, country }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (origin) => {
    onSelect(origin);
    setOpen(false);
  };

  return (
    <div className="flight-card" onClick={() => setOpen(true)}>
      <h1 className="iata">{isCountry ? country : iata || "Select"}</h1>
      <p className="city">{isCountry ? "" : city || "City"}</p>

      {open && (
        <div className="selection-overlay" onClick={(e) => e.stopPropagation()}>
          <FlightCardSelection onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
}