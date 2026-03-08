import { useMemo, useEffect, useState } from "react";
import FeaturedFlights from "../components/FeaturedFlights/FeaturedFlights";
import styles from "./Results.module.css";

function getDisplay(location) {
  if (!location) return { iata: "—", city: "" };

  if (typeof location === "string") {
    return { iata: location, city: "" };
  }

  return {
    iata: location.iata ?? location.code ?? "—",
    city: location.city ?? location.name ?? ""
  };
}

export default function Results({ booking, onSelectFlight, onBack }) {
  const from = getDisplay(booking?.search?.from);
  const to = getDisplay(booking?.search?.to);

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  const lowestPrice = useMemo(() => {
    if (!flights.length) return null;
    return Math.min(...flights.map(f => f.base_cost_cad));
  }, [flights]);

  useEffect(() => {
    const origin = booking?.search?.from?.iata;
    const destination = booking?.search?.to?.iata;
    const departureDate = booking?.search?.departDate;

    if (!origin || !destination || !departureDate) {
      setFlights([]);
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({
      origin,
      destination,
      departure_date: departureDate,
      passengers: booking?.tripOptions?.passengers ?? 1
    });
    console.log("Params:", params.toString());

    if (booking?.search?.returnDate) {
      params.append("return_date", booking.search.returnDate);
    }

    if (loading) {
      return <div className={styles.resultsPage}>Loading...</div>;
    }
    async function loadFlights() {
      try {
        const res = await fetch(`/api/flights/search?${params}`);
        const data = await res.json();
        console.log("Flight API response:", data);
        setFlights(data.outbound ?? []);
      } catch (err) {
        console.error("Flight search failed", err);
        setFlights([]);
      } finally {
        setLoading(false);
      }
    }

    loadFlights();
  }, [booking]);


  return (
    <div className={styles.resultsPage}>
      <div className={styles.resultsTopbar}>
        <button
          className={styles.resultsBack}
          type="button"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className={styles.resultsTitle}>
          <h2>
            Showing results from <span>{from.iata}</span> to{" "}
            <span>{to.iata}</span>
          </h2>

          <p className={styles.resultsSubtitle}>
            {flights.length} flights •{" "}
            {booking?.tripOptions?.tripType ?? "round-trip"} •{" "}
            {booking?.tripOptions?.cabinClass ?? "economy"} •{" "}
            {booking?.tripOptions?.passengers ?? 1} passenger(s)
          </p>
        </div>

        <button
          className={styles.resultsFilter}
          type="button"
          onClick={() => alert("Filters coming soon")}
        >
          Filter
        </button>
      </div>

      <div className={styles.resultsList}>
        {flights.map(flight => {
          const isLowest =
            lowestPrice !== null && Number(flight?.base_cost_cad.toFixed(2)) == Number(lowestPrice.toFixed(2));

          return (
            <button
              key={flight?.flight_no}
              type="button"
              className={`${styles.resultCard} ${
                isLowest ? styles.lowest : ""
              }`}
              onClick={() => onSelectFlight(flight)}
            >
              <div className={styles.resultLeft}>
                <div className={styles.resultTime}>
                  <div className={styles.time}>
                    {new Date(
                      flight?.departure_time
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>

                  <div className={styles.iata}>
                    {flight?.origin_iata}
                  </div>
                </div>

                <div className={styles.resultArrow}>→</div>

                <div className={styles.resultTime}>
                  <div className={styles.time}>
                    {new Date(
                      flight?.arrival_time
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>

                  <div className={styles.iata}>
                    {flight?.destination_iata}
                  </div>
                </div>

                <div className={styles.resultMeta}>
                  <div className={styles.seats}>
                    {flight?.seats_left} seats left
                  </div>

                  {isLowest && (
                    <div className={styles.badge}>
                      Lowest price
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.resultRight}>
                <div className={styles.price}>
                  ${flight?.base_cost_cad}
                </div>
                <div className={styles.perPerson}>
                  per person
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className={styles.resultsViewmoreWrap}>
        <button
          className={styles.resultsViewmore}
          type="button"
          onClick={() => alert("Pagination coming soon")}
        >
          View more
        </button>
      </div>

      <div className={styles.resultsFeatured}>
        <FeaturedFlights />
      </div>
    </div>
  );
}