import { useMemo } from "react";
import { mockFlights } from "../data/mockFlights";
import FeaturedFlights from "../components/FeaturedFlights/FeaturedFlights"; // adjust if your path differs
import styles from "./Results.module.css";

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
    <div className={styles.resultsPage}>
      <div className={styles.resultsTopbar}>
        <button className={styles.resultsBack} type="button" onClick={onBack}>
          ← Back
        </button>

        <div className={styles.resultsTitle}>
          <h2>
            Showing results from <span>{from.iata}</span> to <span>{to.iata}</span>
          </h2>
          <p className={styles.resultsSubtitle}>
            {flights.length} flights • {booking?.tripOptions?.tripType ?? "round-trip"} •{" "}
            {booking?.tripOptions?.cabinClass ?? "economy"} •{" "}
            {booking?.tripOptions?.passengers ?? 1} passenger(s)
          </p>
        </div>

        <button className={styles.resultsFilter} type="button" onClick={() => alert("Filters coming soon")}>
          Filter
        </button>
      </div>

      <div className={styles.resultsList}>
        {flights.map((flight) => {
          const isLowest = lowestPrice != null && flight.price === lowestPrice;

          return (
            <button
              key={flight.id}
              type="button"
              className={`${styles.resultCard} ${isLowest ? styles.lowest : ""}`}
              onClick={() => onSelectFlight(flight)}
            >
              <div className={styles.resultLeft}>
                <div className={styles.resultTime}>
                  <div className={styles.time}>{flight.departTime}</div>
                  <div className={styles.iata}>{flight.origin.iata}</div>
                </div>

                <div className={styles.resultArrow}>→</div>

                <div className={styles.resultTime}>
                  <div className={styles.time}>{flight.arriveTime}</div>
                  <div className={styles.iata}>{flight.destination.iata}</div>
                </div>

                <div className={styles.resultMeta}>
                  <div className={styles.seats}>{flight.seatsLeft} seats left</div>
                  {isLowest && <div className={styles.badge}>Lowest price</div>}
                </div>
              </div>

              <div className={styles.resultRight}>
                <div className={styles.price}>${flight.price}</div>
                <div className={styles.perPerson}>per person</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className={styles.resultsViewmoreWrap}>
        <button
          type="button"
          className={styles.resultsViewmore}
          onClick={() => alert("Pagination coming soon")}
        >
          View more
        </button>
      </div>

      {/* <div className={styles.resultsFeatured}>
        <FeaturedFlights />
      </div> */}
    </div>
  );
}