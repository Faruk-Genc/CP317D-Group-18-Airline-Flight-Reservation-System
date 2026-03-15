import { useMemo, useEffect, useState, useRef } from "react";
import styles from "./Results.module.css";
import countries from "../../../scripts/flightgenerator/data/countries.json"; 
import lottie from "lottie-web";
import loadingAnimation from "../assets/animation/loading.json";

function getDisplay(location) {
  if (!location) return { iata: "—", city: "" };
  if (typeof location === "string") return { iata: location, city: "" };
  return {
    iata: location.iata ?? location.code ?? "—",
    city: location.city ?? location.name ?? ""
  };
}

function displayIataOrCountry(iata) {
  if (!iata) return "—";
  if (iata.length === 2) return countries[iata.toUpperCase()] ?? iata; 
  return iata;
}

function Loader({ hidden }) {
  const container = useRef(null);

  useEffect(() => {
    if (hidden) return;
    const anim = lottie.loadAnimation({
      container: container.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: loadingAnimation,
    });
    return () => anim?.destroy();
  }, [hidden]);

  if (hidden) return null;

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100%",
    }}>
      <div ref={container} style={{ width: 200, height: 200 }}></div>
    </div>
  );
}

export default function Results({ booking, onSelectFlight, onBack, forceHideLoader = false }) {
  const from = getDisplay(booking?.search?.from);
  const to = getDisplay(booking?.search?.to);

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [didFetch, setDidFetch] = useState(false); 

  const inboundSelection =
    booking?.tripOptions.tripType === "round-trip" &&
    booking?.selectedFlight?.outbound?.flight != null;

  const lowestPrice = useMemo(() => {
    if (!flights.length) return null;
    return Math.min(...flights.map(f => f.base_cost_cad));
  }, [flights]);

  useEffect(() => {
  if (forceHideLoader) return; 

  const origin = inboundSelection ? booking?.search.to?.iata : booking?.search.from?.iata;
  const destination = inboundSelection ? booking?.search.from?.iata : booking?.search.to?.iata;
  const departureDate = inboundSelection ? booking?.search.returnDate : booking?.search.departDate;

  if (!origin || !destination || !departureDate) return;

  const params = new URLSearchParams({
    origin,
    destination,
    departure_date: departureDate,
    passengers: booking?.tripOptions?.passengers ?? 1
  });

  let cancelled = false;

  async function loadFlights() {
    setLoading(true);
    try {
      const res = await fetch(`/api/flights/search?${params}`);
      if (cancelled) return;
      const data = await res.json();
      setFlights(data.outbound ?? []);
    } catch (err) {
      if (cancelled) return;
      console.error("Flight search failed", err);
      setFlights([]);
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  loadFlights();

  return () => { cancelled = true; };
}, [
  booking.search.from,
  booking.search.to,
  booking.search.departDate,
  booking.search.returnDate,
  booking.selectedFlight?.outbound?.flight,
  inboundSelection,
  forceHideLoader
]);

  const displayFrom = inboundSelection ? to : from;
  const displayTo = inboundSelection ? from : to;

  if (loading && !forceHideLoader) return <Loader hidden={forceHideLoader} />;

  return (
    <div className={styles.resultsPage}>
      <div className={styles.resultsTopbar}>
        <button className={styles.resultsBack} type="button" onClick={onBack}>
          ← Back
        </button>
        <div className={styles.resultsTitle}>
          <h2>
            Showing results from <span>{displayIataOrCountry(displayFrom.iata)}</span> to{" "}
            <span>{displayIataOrCountry(displayTo.iata)}</span>
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

      <div className={styles.progress}>
        <span className={!inboundSelection ? styles.activeStep : ""}>
          Select departing flight
        </span>
        {booking?.tripOptions?.tripType === "round-trip" && (
          <>
            <span className={styles.arrow}>›</span>
            <span className={inboundSelection ? styles.activeStep : ""}>
              Select return flight
            </span>
          </>
        )}
        <span className={styles.arrow}>›</span>
        <span>Confirmation</span>
      </div>

      <div className={styles.resultsList}>
        {flights.map(flight => {
          const isLowest =
            lowestPrice !== null && Number(flight?.base_cost_cad.toFixed(2)) === Number(lowestPrice.toFixed(2));
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
              className={`${styles.resultCard} ${isLowest ? styles.lowest : ""}`}
              onClick={() => onSelectFlight(flight)}
            >
              <div className={styles.resultLeft}>
                <div className={styles.resultTime}>
                  <div className={styles.time}>
                    {dep.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className={styles.iata}>
                    {displayIataOrCountry(flight?.origin_iata)}
                  </div>
                </div>
                <div className={styles.resultArrow}>→</div>
                <div className={styles.resultTime}>
                  <div className={styles.time}>
                    {arr.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className={styles.iata}>
                    {displayIataOrCountry(flight?.destination_iata)}
                  </div>
                </div>
                <div className={styles.resultMeta}>
                  <div className={styles.seats}>{flight?.seats_left} seats left</div>
                  {isLowest && <div className={styles.badge}>Lowest price</div>}
                </div>
              </div>

              <div className={styles.durationCenter}>{duration}</div>

              <div className={styles.resultRight}>
                <div className={styles.price}>${flight?.base_cost_cad}</div>
                <div className={styles.perPerson}>per person</div>
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