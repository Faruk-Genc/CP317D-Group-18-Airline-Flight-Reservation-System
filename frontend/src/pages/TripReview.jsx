import { useEffect, useMemo, useState } from "react";
import styles from "./TripReview.module.css";

function formatMoney(amount, currency = "CAD") {
    const num = Number(amount || 0);
    try {
        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(num);
    } catch {
        return `$${num}`;
    }
}

export default function TripReview({ booking, onConfirm, onBack }) {
    const flight = booking?.selectedFlight;
    // Basic guard if user lands here without selecting a flight
    if (!flight) {
        return (
            <div className={styles.reviewPage}>
                <div className={styles.reviewCard}>
                    <h2>Trip Review</h2>
                    <p>No flight selected yet.</p>
                    <button type="button" className={`${styles.reviewBtn} ${styles.secondary}`} onClick={onBack}>
                        Back to results
                    </button>
                </div>
            </div>
        );
    }

    const currency = booking?.priceSummary?.currency ?? "CAD";

    // Countdown (placeholder): 10 minutes from when page is opened
    const [secondsLeft, setSecondsLeft] = useState(10 * 60);

    useEffect(() => {
        const t = setInterval(() => {
            setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => clearInterval(t);
    }, []);

    const countdown = useMemo(() => {
        const m = Math.floor(secondsLeft / 60);
        const s = secondsLeft % 60;
        return `${m}:${String(s).padStart(2, "0")}`;
    }, [secondsLeft]);

    const baseFare = booking?.priceSummary?.baseFare ?? flight.price ?? 0;
    const taxesAndFees = booking?.priceSummary?.taxesAndFees ?? 50;
    const total = booking?.priceSummary?.total ?? (baseFare + taxesAndFees);

    const passengers = booking?.tripOptions?.passengers ?? 1;
    const cabinClass = booking?.tripOptions?.cabinClass ?? "economy";
    const tripType = booking?.tripOptions?.tripType ?? "round-trip";

    return (
        <div className={styles.reviewPage}>
            <div className={styles.reviewTopbar}>
                <button type="button" className={`${styles.reviewBtn} ${styles.secondary}`} onClick={onBack}>
                    ← Back
                </button>

                <div className={styles.reviewTitle}>
                    <h2>Review your trip</h2>
                    <p>Confirm your selection before purchase.</p>
                </div>

                <div className={styles.reviewTimer}>
                    <div className={styles.timerLabel}>Time remaining</div>
                    <div className={`${styles.timerValue} ${secondsLeft === 0 ? styles.expired : ""}`}>{countdown}</div>
                </div>
            </div>

            <div className={styles.reviewGrid}>
                {/* Left: flight summary */}
                <div className={styles.reviewCard}>
                    <h3>Selected flight</h3>

                    <div className={styles.flightRow}>
                        <div className={styles.flightBlock}>
                            <div className={styles.flightTime}>{flight.departTime}</div>
                            <div className={styles.flightIata}>{flight.origin?.iata}</div>
                            <div className={styles.flightCity}>{flight.origin?.city}</div>
                        </div>

                        <div className={styles.flightArrow}>→</div>

                        <div className={styles.flightBlock}>
                            <div className={styles.flightTime}>{flight.arriveTime}</div>
                            <div className={styles.flightIata}>{flight.destination?.iata}</div>
                            <div className={styles.flightCity}>{flight.destination?.city}</div>
                        </div>
                    </div>

                    <div className={styles.flightMeta}>
                        <div><span className={styles.label}>Flight:</span> {flight.id}</div>
                        <div><span className={styles.label}>Seats left:</span> {flight.seatsLeft}</div>
                    </div>

                    <div className={styles.tripOptionsBox}>
                        <div className={styles.tripOptionsTitle}>Trip options</div>
                        <div className={styles.tripOptionsGrid}>
                            <div><span className={styles.label}>Trip type:</span> {tripType}</div>
                            <div><span className={styles.label}>Cabin:</span> {cabinClass}</div>
                            <div><span className={styles.label}>Passengers:</span> {passengers}</div>
                            <div>
                                <span className={styles.label}>Dates:</span>{" "}
                                {booking?.search?.departDate ?? "—"}
                                {tripType === "round-trip" ? ` → ${booking?.search?.returnDate ?? "—"}` : ""}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: pricing */}
                <div className={styles.reviewCard}>
                    <h3>Price summary</h3>

                    <div className={styles.priceLines}>
                        <div className={styles.priceLine}>
                            <span>Base fare</span>
                            <span>{formatMoney(baseFare * passengers, currency)}</span>
                        </div>
                        <div className={styles.priceLine}>
                            <span>Taxes & fees</span>
                            <span>{formatMoney(taxesAndFees * passengers, currency)}</span>
                        </div>

                        <div className={styles.divider} />

                        <div className={`${styles.priceLine} ${styles.total}`}>
                            <span>Total</span>
                            <span>{formatMoney((baseFare + taxesAndFees) * passengers, currency)}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={`${styles.reviewBtn} ${styles.primary}`}
                        onClick={onConfirm}
                        disabled={secondsLeft === 0}
                        title={secondsLeft === 0 ? "Session expired — go back to results" : ""}
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