import { useMemo } from "react";
import "./Confirmation.css";

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

export default function Confirmation({ booking, onBackHome }) {
    const flight = booking?.selectedFlight;
    // If user lands here without selecting, show a safe fallback
    if (!flight) {
        return (
            <div className="confirm-page">
                <div className="ticket">
                    <div className="ticket-header">
                        <div>
                            <div className="status">⚠️ Missing selection</div>
                            <h2 className="title">No booking found</h2>
                        </div>
                        <button type="button" className="btn secondary" onClick={onBackHome}>
                            Back to Home
                        </button>
                    </div>
                    <p className="muted">Please start a new search and complete the booking flow.</p>
                </div>
            </div>
        );
    }

    const reference = booking?.confirmation?.reference;
    const currency = booking?.priceSummary?.currency ?? "CAD";

    const passengers = booking?.tripOptions?.passengers ?? 1;
    const cabinClass = booking?.tripOptions?.cabinClass ?? "economy";
    const tripType = booking?.tripOptions?.tripType ?? "round-trip";

    const baseFare = booking?.priceSummary?.baseFare ?? flight.price ?? 0;
    const taxesAndFees = booking?.priceSummary?.taxesAndFees ?? 50;

    const total = (baseFare + taxesAndFees) * passengers;

    return (
        <div className="confirm-page">
            <div className="ticket">
                <div className="ticket-header">
                    <div>
                        <div className="status confirmed">✅ Confirmed</div>
                        <h2 className="title">Your ticket is ready</h2>
                        <div className="ref-row">
                            <span className="ref-label">Booking reference:</span>
                            <span className="ref">{reference ?? "—"}</span>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button
                            type="button"
                            className="btn secondary"
                            onClick={() => alert("Print/Download coming soon")}
                        >
                            Print / Download
                        </button>
                        <button type="button" className="btn primary" onClick={onBackHome}>
                            Back to Home
                        </button>
                    </div>
                </div>

                <div className="ticket-body">
                    <div className="ticket-left">
                        <div className="section">
                            <h3>Flight details</h3>

                            <div className="route">
                                <div className="stop">
                                    <div className="time">{flight.departTime}</div>
                                    <div className="iata">{flight.origin?.iata}</div>
                                    <div className="city">{flight.origin?.city}</div>
                                </div>

                                <div className="route-mid">
                                    <div className="line" />
                                    <div className="arrow">→</div>
                                </div>

                                <div className="stop">
                                    <div className="time">{flight.arriveTime}</div>
                                    <div className="iata">{flight.destination?.iata}</div>
                                    <div className="city">{flight.destination?.city}</div>
                                </div>
                            </div>

                            <div className="kv-grid">
                                <div className="kv">
                                    <div className="k">Flight</div>
                                    <div className="v">{flight.id}</div>
                                </div>
                                <div className="kv">
                                    <div className="k">Seats left</div>
                                    <div className="v">{flight.seatsLeft}</div>
                                </div>
                                <div className="kv">
                                    <div className="k">Trip type</div>
                                    <div className="v">{tripType}</div>
                                </div>
                                <div className="kv">
                                    <div className="k">Cabin</div>
                                    <div className="v">{cabinClass}</div>
                                </div>
                                <div className="kv">
                                    <div className="k">Passengers</div>
                                    <div className="v">{passengers}</div>
                                </div>
                                <div className="kv">
                                    <div className="k">Total</div>
                                    <div className="v strong">{formatMoney(total, currency)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="section">
                            <h3>Price breakdown</h3>
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
                                    <span>{formatMoney(total, currency)}</span>
                                </div>
                            </div>
                            <p className="muted small">
                                Demo note: passenger names and ticket numbers will be added later when the passenger
                                details page is implemented.
                            </p>
                        </div>
                    </div>

                    <div className="ticket-right">
                        <div className="qr-card">
                            <div className="qr-box" />
                            <div className="qr-text">
                                <div className="qr-title">Boarding pass</div>
                                <div className="muted small">
                                    QR code placeholder (will be generated later)
                                </div>
                            </div>
                        </div>

                        <div className="help-card">
                            <div className="help-title">Need help?</div>
                            <div className="muted small">
                                This is a demo confirmation screen. Check-in and My Flights lookup will be wired
                                later.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ticket-footer">
                    <div className="muted small">
                        Placeholder Airlines • Privacy • Terms
                    </div>
                </div>
            </div>
        </div>
    );
}