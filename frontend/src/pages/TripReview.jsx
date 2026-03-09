import { useEffect, useMemo, useState } from "react";
import styles from "./TripReview.module.css";

function formatMoney(amount, currency = "CAD") {
  const num = Number(amount || 0);

  try {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(num);
  } catch {
    return `$${num}`;
  }
}

export default function TripReview({ booking, onConfirm, onBack }) {
  const flight = booking?.selectedFlight;
  useEffect(() => {
    console.log("Flight:", flight)
  },[flight])

  const currency = booking?.priceSummary?.currency ?? "CAD";

  const passengers = booking?.tripOptions?.passengers ?? 1;
  const cabinClass = booking?.tripOptions?.cabinClass ?? "economy";
  const tripType = booking?.tripOptions?.tripType ?? "round-trip";

  const baseFare = booking?.priceSummary?.baseFare ?? 0;
  const taxesAndFees = booking?.priceSummary?.taxesAndFees ?? 0;
  const total = booking?.priceSummary?.total ?? 0;


  const [secondsLeft, setSecondsLeft] = useState(10 * 60);

  useEffect(() => {
    setSecondsLeft(10 * 60);

    const timer = setInterval(() => {
      setSecondsLeft(s => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [flight]);

  const countdown = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  if (!flight) {
    return (
      <div className={styles.reviewPage}>
        <div className={styles.reviewCard}>
          <h2>Trip Review</h2>
          <p>No flight selected yet.</p>

          <button
            type="button"
            className={`${styles.reviewBtn} ${styles.secondary}`}
            onClick={onBack}
          >
            Back to results
          </button>
        </div>
      </div>
    );
  }
  const outboundFlight = booking?.selectedFlight?.outbound?.flight;
  const outboundTimes = booking?.selectedFlight?.outbound?.times;

  const inboundFlight = booking?.selectedFlight?.inbound?.flight;
  const inboundTimes = booking?.selectedFlight?.inbound?.times;

  return (
    <div className={styles.reviewPage}>
      <div className={styles.reviewTopbar}>
        <button
          type="button"
          className={`${styles.reviewBtn} ${styles.secondary}`}
          onClick={onBack}
        >
          ← Back
        </button>

        
        <div className={styles.reviewTimer}>
          <div className={styles.timerLabel}>Time remaining</div>

          <div
            className={`${styles.timerValue} ${
              secondsLeft === 0 ? styles.expired : ""
            }`}
          >
            {countdown}
          </div>
        </div>
      </div>
      <div className={styles.reviewTitle}>
                <h2>Review your trip</h2>
                <p>Confirm your selection before purchase.</p>
              </div>

      <div className={styles.reviewGrid}>
        {/* Flight summary */}
        <div className={styles.reviewCard}>
            <div className={styles.flightMeta}>
                        <div>
                          <span className={styles.label}>Flight:</span> {<b>{outboundFlight?.flight_no}</b>}
                        </div>

                        <div>
                          <span className={styles.label}>Seats left:</span>{" "}
                          {outboundFlight?.seats_left}
                        </div>
                      </div>
          {outboundFlight && (
            
            <div className={styles.flightRow}>
            <h3>Departing flight</h3>
            <div className={styles.flightBlock}>
              <div className={styles.flightTime}>{outboundTimes?.departure}</div>
              <div className={styles.flightIata}>{outboundFlight?.origin_iata}</div>
              <div className={styles.flightCity}>{outboundFlight?.origin_city}</div>
            </div>
            <div className={styles.flightArrow}>→</div>
            <div className={styles.flightBlock}>
              <div className={styles.flightTime}>{outboundTimes?.arrival}</div>
              <div className={styles.flightIata}>{outboundFlight?.destination_iata}</div>
              <div className={styles.flightCity}>{outboundFlight?.destination_city}</div>
            </div>
          </div>
          )}
          

          {inboundFlight && (
            <>
              <div className={styles.flightMeta}>
            <div>
              <span className={styles.label}>Flight:</span> {<b>{inboundFlight?.flight_no}</b>}
            </div>

            <div>
              <span className={styles.label}>Seats left:</span>{" "}
              {inboundFlight?.seats_left}
            </div>
              </div>
             
            <div className={styles.flightRow}>
            <h3>Return Flight</h3>
            <div className={styles.flightBlock}>
              <div className={styles.flightTime}>{inboundTimes?.departure}</div>
              <div className={styles.flightIata}>{inboundFlight?.origin_iata}</div>
              <div className={styles.flightCity}>{inboundFlight?.origin_city}</div>
            </div>
            <div className={styles.flightArrow}>→</div>
            <div className={styles.flightBlock}>
              <div className={styles.flightTime}>{inboundTimes?.arrival}</div>
              <div className={styles.flightIata}>{inboundFlight?.destination_iata}</div>
              <div className={styles.flightCity}>{inboundFlight?.destination_city}</div>
            </div>
            </div>
             </>
          )}
          

          <div className={styles.tripOptionsBox}>
            <div className={styles.tripOptionsTitle}>Trip options</div>

            <div className={styles.tripOptionsGrid}>
              <div>
                <span className={styles.label}>Trip type:</span> {tripType}
              </div>

              <div>
                <span className={styles.label}>Cabin:</span> {cabinClass}
              </div>

              <div>
                <span className={styles.label}>Passengers:</span> {passengers}
              </div>

              
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className={styles.reviewCard}>
          <h3>Price summary</h3>

          <div className={styles.priceLines}>
            <div className={styles.priceLine}>
              <span>Base fare</span>
              <span>{formatMoney(baseFare, currency)}</span>
            </div>

            <div className={styles.priceLine}>
              <span>Taxes & fees</span>
              <span>{formatMoney(taxesAndFees * passengers, currency)}</span>
            </div>

            <div className={styles.divider} />

            <div className={`${styles.priceLine} ${styles.total}`}>
              <span>Total</span>
              <span>{formatMoney(total, currency)}</span>
            </div>
          </div>

          <button
            type="button"
            className={`${styles.reviewBtn} ${styles.primary}`}
            onClick={onConfirm}
            disabled={secondsLeft === 0}
            title={
              secondsLeft === 0
                ? "Session expired — go back to results"
                : ""
            }
          >
            I accept, purchase
          </button>

          {secondsLeft === 0 && (
            <p className={styles.expiredNote}>
              Your session expired. Please go back and re-select a flight.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}