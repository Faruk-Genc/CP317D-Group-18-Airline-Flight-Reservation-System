import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import "./FlightInfo.css";

export default function FlightInfo({ aita1, city1, aita2, city2 }) {
  const [swapped, setSwapped] = useState(false);

  return (
    <div className="flight-container">
      {swapped ? (
        <>
          <div className="flight-card">
            <h1 className="aita">{aita2}</h1>
            <p>{city2}</p>
          </div>
          <div className="flight-card">
            <h1 className="aita">{aita1}</h1>
            <p>{city1}</p>
          </div>
        </>
      ) : (
        <>
          <div className="flight-card">
            <h1 className="aita">{aita1}</h1>
            <p>{city1}</p>
          </div>
          <div className="flight-card">
            <h1 className="aita">{aita2}</h1>
            <p>{city2}</p>
          </div>
        </>
      )}
      <button className="switch-card" onClick={() => setSwapped(!swapped)}>
        <ArrowLeftRight size={24} className={swapped ? "rotated" : ""} />
      </button>
    </div>
  );
}