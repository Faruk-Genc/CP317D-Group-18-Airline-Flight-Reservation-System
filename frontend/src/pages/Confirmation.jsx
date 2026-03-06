import { useMemo } from "react";
import styles from "./Confirmation.module.css";

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
            <div className={styles.confirmPage}>
                <div className={styles.ticket}>
                    <div className={styles.ticketHeader}>
                        <div>
                            <div className={styles.status}>⚠️ Missing selection</div>
                            <h2 className={styles.title}>No booking found</h2>
                        </div>
                        <button type="button" className={`${styles.btn} ${styles.secondary}`} onClick={onBackHome}>
                            Back to Home
                        </button>
                    </div>
                    <p className={styles.muted}>Please start a new search and complete the booking flow.</p>
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
        <div className={styles.confirmPage}>
            <div className={styles.ticket}>
                <div className={styles.ticketHeader}>
                    <div>
                        <div className={`${styles.status} ${styles.confirmed}`}>✅ Confirmed</div>
                        <h2 className={styles.title}>Your ticket is ready</h2>
                        <div className={styles.refRow}>
                            <span className={styles.refLabel}>Booking reference:</span>
                            <span className={styles.ref}>{reference ?? "—"}</span>
                        </div>
                    </div>

                    <div className={styles.headerActions}>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.secondary}`}
                            onClick={() => alert("Print/Download coming soon")}
                        >
                            Print / Download
                        </button>
                        <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={onBackHome}>
                            Back to Home
                        </button>
                    </div>
                </div>

                <div className={styles.ticketBody}>
                    <div className={styles.ticketLeft}>
                        <div className={styles.section}>
                            <h3>Flight details</h3>

                            <div className={styles.route}>
                                <div className={styles.stop}>
                                    <div className={styles.time}>{booking?.flightTimes?.departureTime}</div>
                                    <div className={styles.iata}>{flight?.origin_iata}</div>
                                    <div className={styles.city}>{flight?.origin_city}</div>
                                </div>

                                <div className={styles.routeMid}>
                                    <div className={styles.arrow}>→</div>
                                </div>

                                <div className={styles.stop}>
                                    <div className={styles.time}>{booking?.flightTimes?.arrivalTime}</div>
                                    <div className={styles.iata}>{flight?.destination_iata}</div>
                                    <div className={styles.city}>{flight?.destination_city}</div>
                                </div>
                            </div>

                            <div className={styles.kvGrid}>
                                <div className={styles.kv}>
                                    <div className={styles.k}>Flight</div>
                                    <div className={styles.v}>{flight?.flight_no}</div>
                                </div>
                                <div className={styles.kv}>
                                    <div className={styles.k}>Seats left</div>
                                    <div className={styles.v}>{flight.seatsLeft}</div>
                                </div>
                                <div className={styles.kv}>
                                    <div className={styles.k}>Trip type</div>
                                    <div className={styles.v}>{tripType}</div>
                                </div>
                                <div className={styles.kv}>
                                    <div className={styles.k}>Cabin</div>
                                    <div className={styles.v}>{cabinClass}</div>
                                </div>
                                <div className={styles.kv}>
                                    <div className={styles.k}>Passengers</div>
                                    <div className={styles.v}>{passengers}</div>
                                </div>
                                <div className={styles.kv}>
                                    <div className={styles.k}>Total</div>
                                    <div className={`${styles.v} ${styles.strong}`}>{formatMoney(total, currency)}</div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h3>Price breakdown</h3>
                            <div className={styles.priceLines}>
                                <div className={styles.priceLine}>
                                    <span>Base fare</span>
                                    
                                    <span>{formatMoney(booking?.priceSummary?.baseFare,currency)}</span>
                                </div>
                                <div className={styles.priceLine}>
                                    <span>Taxes & fees</span>
                                    <span>{formatMoney(booking?.priceSummary?.taxesAndFees * passengers, currency)}</span>
                                </div>
                                <div className={styles.divider} />
                                <div className={`${styles.priceLine} ${styles.total}`}>
                                    <span>Total</span>
                                    <span>{formatMoney(total, currency)}</span>
                                </div>
                            </div>
                            <p className={`${styles.muted} ${styles.small}`}>
                                Demo note: passenger names and ticket numbers will be added later when the passenger
                                details page is implemented.
                            </p>
                        </div>
                    </div>

                    <div className={styles.ticketRight}>
                        <div className={styles.qrCard}>
                            <div className={styles.qrBox} />
                            <div className={styles.qrText}>
                                <div className={styles.qrTitle}>Boarding pass</div>
                                <div className={`${styles.muted} ${styles.small}`}>
                                    QR code placeholder (will be generated later)
                                </div>
                            </div>
                        </div>

                        <div className={styles.helpCard}>
                            <div className={styles.helpTitle}>Need help?</div>
                            <div className={`${styles.muted} ${styles.small}`}>
                                This is a demo confirmation screen. Check-in and My Flights lookup will be wired
                                later.
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.ticketFooter}>
                    <div className={`${styles.muted} ${styles.small}`}>
                        Placeholder Airlines • Privacy • Terms
                    </div>
                </div>
            </div>
        </div>
    );
}