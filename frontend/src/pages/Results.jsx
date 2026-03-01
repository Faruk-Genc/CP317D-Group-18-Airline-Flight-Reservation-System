import { useMemo } from "react";
import { mockFlights } from "../data/mockFlights";
import FeaturedFlights from "../components/FeaturedFlights/FeaturedFlights"; // adjust if your path differs
import "./Results.css";

function getDisplay(location) {
  if (!location) return { iata: "—", city: "" };
  if (typeof location === "string") return { iata: location, city: "" };
  return {
    iata: location.iata ?? location.code ?? "—",
    city: location.city ?? location.name ?? "",
  };
}

export default function Results({ booking, onSelectFlight, onBack }) {
  const from = getDisplay(booking?.search?.from);
  const to = getDisplay(booking?.search?.to);

  // Currently shows mockFlights
  // replace with API results filtered by booking.search + booking.tripOptions.
  const flights = useMemo(() => mockFlights, []);

  const lowestPrice = useMemo(() => {
    if (!flights.length) return null;
    return Math.min(...flights.map((f) => f.price));
  }, [flights]);

  return (
    <div className="results-page">
      <div className="results-topbar">
        <button className="results-back" type="button" onClick={onBack}>
          ← Back
        </button>

        <div className="results-title">
          <h2>
            Showing results from <span>{from.iata}</span> to <span>{to.iata}</span>
          </h2>
          <p className="results-subtitle">
            {flights.length} flights • {booking?.tripOptions?.tripType ?? "round-trip"} •{" "}
            {booking?.tripOptions?.cabinClass ?? "economy"} •{" "}
            {booking?.tripOptions?.passengers ?? 1} passenger(s)
          </p>
        </div>

        <button className="results-filter" type="button" onClick={() => alert("Filters coming soon")}>
          Filter
        </button>
      </div>

      <div className="results-list">
        {flights.map((flight) => {
          const isLowest = lowestPrice != null && flight.price === lowestPrice;

          return (
            <button
              key={flight.id}
              type="button"
              className={`result-card ${isLowest ? "lowest" : ""}`}
              onClick={() => onSelectFlight(flight)}
            >
              <div className="result-left">
                <div className="result-time">
                  <div className="time">{flight.departTime}</div>
                  <div className="iata">{flight.origin.iata}</div>
                </div>

                <div className="result-arrow">→</div>

                <div className="result-time">
                  <div className="time">{flight.arriveTime}</div>
                  <div className="iata">{flight.destination.iata}</div>
                </div>

                <div className="result-meta">
                  <div className="seats">{flight.seatsLeft} seats left</div>
                  {isLowest && <div className="badge">Lowest price</div>}
                </div>
              </div>

              <div className="result-right">
                <div className="price">${flight.price}</div>
                <div className="per-person">per person</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="results-viewmore-wrap">
        <button
          type="button"
          className="results-viewmore"
          onClick={() => alert("Pagination coming soon")}
        >
          View more
        </button>
      </div>

      <div className="results-featured">
        <FeaturedFlights />
      </div>
    </div>
  );
}