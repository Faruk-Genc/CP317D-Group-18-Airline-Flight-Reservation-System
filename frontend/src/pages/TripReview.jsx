import { useEffect, useMemo, useState } from "react";
import styles from "./TripReview.module.css";
import { useUser } from "../context/UserContext";

const TIMER_DURATION = 10 * 60 * 1000;
const STORAGE_KEY = "booking_timer";

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

export default function TripReview({ booking, onConfirm, onBack, onSignIn }) {
  const { user } = useUser();
  const flight = booking?.selectedFlight;

  const currency = booking?.priceSummary?.currency ?? "CAD";
  const passengers = booking?.tripOptions?.passengers ?? 1;
  const cabinClass = booking?.tripOptions?.cabinClass ?? "economy";
  const tripType = booking?.tripOptions?.tripType ?? "round-trip";

  const baseFare = booking?.priceSummary?.baseFare ?? 0;
  const taxesAndFees = booking?.priceSummary?.taxesAndFees ?? 0;
  const total = booking?.priceSummary?.total ?? 0;

  const [secondsLeft, setSecondsLeft] = useState(10 * 60);

  const flightId = useMemo(() => {
    if (!flight) return null;
    return JSON.stringify({
      out: flight?.outbound?.flight?.flight_no,
      in: flight?.inbound?.flight?.flight_no,
      total
    });
  }, [flight, total]);

  useEffect(() => {
    if (!flightId) return;

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    let startTime;

    if (stored.flightId !== flightId) {
      startTime = Date.now();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ flightId, startTime })
      );
    } else {
      startTime = stored.startTime;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(TIMER_DURATION - elapsed, 0);
      setSecondsLeft(Math.floor(remaining / 1000));

      if (remaining <= 0) {
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [flightId]);

  const countdown = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  if (!flight || (booking.priceSummary?.total ?? 0) === 0) {
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

  const outboundFlight = flight?.outbound?.flight;
  const outboundTimes = flight?.outbound?.times;
  const inboundFlight = flight?.inbound?.flight;
  const inboundTimes = flight?.inbound?.times;

  const handleConfirm = () => {
    localStorage.removeItem(STORAGE_KEY);
    onConfirm();
  };

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
          <div className={`${styles.timerValue} ${secondsLeft === 0 ? styles.expired : ""}`}>
            {countdown}
          </div>
        </div>
      </div>

      <div className={styles.reviewTitle}>
        <h2>Review your trip</h2>
        <p>Confirm your selection before purchase.</p>
      </div>

      <div className={styles.reviewGrid}>
        <div className={styles.reviewCard}>
          {outboundFlight && (
            <>
              <div className={styles.flightMeta}>
                <div>
                  <span className={styles.label}>Flight:</span> <b>{outboundFlight?.flight_no}</b>
                </div>
                <div>
                  <span className={styles.label}>Seats left:</span> {outboundFlight?.seats_left}
                </div>
              </div>

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
            </>
          )}

          {inboundFlight && (
            <>
              <div className={styles.flightMeta}>
                <div>
                  <span className={styles.label}>Flight:</span> <b>{inboundFlight?.flight_no}</b>
                </div>
                <div>
                  <span className={styles.label}>Seats left:</span> {inboundFlight?.seats_left}
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
              <div><span className={styles.label}>Trip type:</span> {tripType}</div>
              <div><span className={styles.label}>Cabin:</span> {cabinClass}</div>
              <div><span className={styles.label}>Passengers:</span> {passengers}</div>
            </div>
          </div>
        </div>

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

          {!user && (
            <button
              type="button"
              className={`${styles.reviewBtn} ${styles.primary}`}
              onClick={onSignIn}
            >
              Sign Up / Sign In
            </button>
          )}

          <button
            type="button"
            className={`${styles.reviewBtn} ${styles.primary}`}
            onClick={handleConfirm}
            disabled={!user || secondsLeft === 0}
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