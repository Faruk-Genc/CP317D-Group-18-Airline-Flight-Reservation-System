import { useEffect, useMemo, useState } from "react";
import "./TripReview.css";

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
            <div className="review-page">
                <div className="review-card">
                    <h2>Trip Review</h2>
                    <p>No flight selected yet.</p>
                    <button type="button" className="review-btn secondary" onClick={onBack}>
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
        <div className="review-page">
            <div className="review-topbar">
                <button type="button" className="review-btn secondary" onClick={onBack}>
                    ← Back
                </button>

                <div className="review-title">
                    <h2>Review your trip</h2>
                    <p>Confirm your selection before purchase.</p>
                </div>

                <div className="review-timer">
                    <div className="timer-label">Time remaining</div>
                    <div className={`timer-value ${secondsLeft === 0 ? "expired" : ""}`}>{countdown}</div>
                </div>
            </div>

            <div className="review-grid">
                {/* Left: flight summary */}
                <div className="review-card">
                    <h3>Selected flight</h3>

                    <div className="flight-row">
                        <div className="flight-block">
                            <div className="flight-time">{flight.departTime}</div>
                            <div className="flight-iata">{flight.origin?.iata}</div>
                            <div className="flight-city">{flight.origin?.city}</div>
                        </div>

                        <div className="flight-arrow">→</div>

                        <div className="flight-block">
                            <div className="flight-time">{flight.arriveTime}</div>
                            <div className="flight-iata">{flight.destination?.iata}</div>
                            <div className="flight-city">{flight.destination?.city}</div>
                        </div>
                    </div>

                    <div className="flight-meta">
                        <div><span className="label">Flight:</span> {flight.id}</div>
                        <div><span className="label">Seats left:</span> {flight.seatsLeft}</div>
                    </div>

                    <div className="trip-options-box">
                        <div className="trip-options-title">Trip options</div>
                        <div className="trip-options-grid">
                            <div><span className="label">Trip type:</span> {tripType}</div>
                            <div><span className="label">Cabin:</span> {cabinClass}</div>
                            <div><span className="label">Passengers:</span> {passengers}</div>
                            <div>
                                <span className="label">Dates:</span>{" "}
                                {booking?.search?.departDate ?? "—"}
                                {tripType === "round-trip" ? ` → ${booking?.search?.returnDate ?? "—"}` : ""}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: pricing */}
                <div className="review-card">
                    <h3>Price summary</h3>

                    <div className="price-lines">
                        <div className="price-line">
                            <span>Base fare</span>
                            <span>{formatMoney(baseFare * passengers, currency)}</span>
                        </div>
                        <div className="price-line">
                            <span>Taxes & fees</span>
                            <span>{formatMoney(taxesAndFees * passengers, currency)}</span>
                        </div>

                        <div className="divider" />

                        <div className="price-line total">
                            <span>Total</span>
                            <span>{formatMoney((baseFare + taxesAndFees) * passengers, currency)}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="review-btn primary"
                        onClick={onConfirm}
                        disabled={secondsLeft === 0}
                        title={secondsLeft === 0 ? "Session expired — go back to results" : ""}
                    >
                        I accept, purchase
                    </button>

                    {secondsLeft === 0 && (
                        <p className="expired-note">
                            Your session expired. Please go back and re-select a flight.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}