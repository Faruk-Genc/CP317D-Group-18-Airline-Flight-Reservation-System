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

  const inboundSelection =
    booking?.tripOptions.tripType === "round-trip" &&
    booking?.selectedFlight?.outbound?.flight != null;
    // selecting return flight


  const lowestPrice = useMemo(() => {
    if (!flights.length) return null;
    return Math.min(...flights.map(f => f.base_cost_cad));
  }, [flights]);

  useEffect(() => {
    setLoading(true);
    const origin = inboundSelection ? booking?.search.to?.iata : booking?.search.from?.iata;
    const destination = inboundSelection ? booking?.search.from?.iata : booking?.search.to?.iata;
    const departureDate = inboundSelection ? booking?.search.returnDate : booking?.search.departDate;

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
  }, [booking.search.from,
  booking.search.to,
  booking.search.departDate,
  booking.search.returnDate,
  booking.selectedFlight?.outbound?.flight]);

  const displayFrom = inboundSelection ? to : from;
  const displayTo = inboundSelection ? from : to;

  if (loading) {
  return (
    <div className={styles.resultsPage}>
      Loading flights...
    </div>
  );
  }
  console.log({
  inboundSelection,
  departDate: booking.search.departDate,
  returnDate: booking.search.returnDate
});
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
            Showing results from <span>{displayFrom.iata}</span> to{" "}
            <span>{displayTo.iata}</span>
          </h2>
        </div>
        

        <button
          className={styles.resultsFilter}
          type="button"
          onClick={() => alert("Filters coming soon")}
        >
          Filter
        </button>
      </div>
      <div className ={styles.progress}>
              <span className={!inboundSelection ? styles.activeStep : ""}>
                  Select departing flight
                </span>
                {booking?.tripOptions?.tripType == 'round-trip' && (
                  <>
                  <span className={styles.arrow}>›</span>
                  <span className={inboundSelection ? styles.activeStep : ""}>
                  Select return flight
                    </span>
                    </>
                )}

                <span className={styles.arrow}>›</span>
                <span>
                  Confirmation
                </span>
              </div>
      <div className={styles.resultsList}>
        {flights.map(flight => {
          const isLowest =
            lowestPrice !== null && Number(flight?.base_cost_cad.toFixed(2)) == Number(lowestPrice.toFixed(2));
          const dep = new Date(flight?.departure_time);
          const arr = new Date(flight?.arrival_time);

          const diffMs = arr - dep;
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

          const duration = `${hours}h ${mins}m`;
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
              
              <div className={styles.durationCenter}>
                  {duration}
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

    </div>
  );
}