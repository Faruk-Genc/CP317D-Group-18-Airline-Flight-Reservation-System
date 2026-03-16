import { useMemo } from "react";
import styles from "./Confirmation.module.css";
import { useUser } from "../context/UserContext";

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
    const outboundFlight = booking?.selectedFlight?.outbound?.flight;
    const outboundTimes = booking?.selectedFlight?.outbound?.times;

    const inboundFlight = booking?.selectedFlight?.inbound?.flight;
    const inboundTimes = booking?.selectedFlight?.inbound?.times;

    const { user } = useUser();

    // If user lands here without selecting, show a safe fallback
    if (!outboundFlight) {
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

    const baseFare = booking?.priceSummary?.baseFare ?? 0;
    const taxesAndFees = booking?.priceSummary?.taxesAndFees ?? 0;
    const total = booking?.priceSummary?.total ?? 0;

    
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
                        {outboundFlight && (
                                <>
                        <div className={styles.section}>
                            
                            <h3>Flight details</h3>
                            <div className={styles.route}>
                                <div className={styles.stop}>
                                    <div className={styles.time}>{outboundTimes?.departure}</div>
                                    <div className={styles.iata}>{outboundFlight?.origin_iata}</div>
                                    <div className={styles.city}>{outboundFlight?.origin_city}</div>
                                </div>

                                <div className={styles.routeMid}>
                                    <div className={styles.arrow}>→</div>
                                </div>

                                <div className={styles.stop}>
                                    <div className={styles.time}>{outboundTimes?.arrival}</div>
                                    <div className={styles.iata}>{outboundFlight?.destination_iata}</div>
                                    <div className={styles.city}>{outboundFlight?.destination_city}</div>
                                </div>
                                    </div>        
                            
                            <div className={styles.kvGrid}>
                                <div className={styles.kv}>
                                    <div className={styles.k}>Flight</div>
                                    <div className={styles.v}>{outboundFlight?.flight_no}</div>
                                </div>
                                <div className={styles.kv}>
                                    <div className={styles.k}>Seats left</div>
                                    <div className={styles.v}>{outboundFlight?.seats_left}</div>
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
                                    <div className={styles.k}>Aircraft</div>
                                    <div className={styles.v}>{outboundFlight?.aircraft}</div>
                                </div>
                            </div>
                                </div>
                            </>
                        )}
                        {inboundFlight && (
                                <>
                        <div className={styles.section}>
                            
                            <h3>Flight details</h3>
                            <div className={styles.route}>
                                <div className={styles.stop}>
                                    <div className={styles.time}>{inboundTimes?.departure}</div>
                                    <div className={styles.iata}>{inboundFlight?.origin_iata}</div>
                                    <div className={styles.city}>{inboundFlight?.origin_city}</div>
                                </div>

                                <div className={styles.routeMid}>
                                    <div className={styles.arrow}>→</div>
                                </div>

                                <div className={styles.stop}>
                                    <div className={styles.time}>{inboundTimes?.arrival}</div>
                                    <div className={styles.iata}>{inboundFlight?.destination_iata}</div>
                                    <div className={styles.city}>{inboundFlight?.destination_city}</div>
                                </div>
                                    </div>        
                            
                            <div className={styles.kvGrid}>
                                <div className={styles.kv}>
                                    <div className={styles.k}>Flight</div>
                                    <div className={styles.v}>{inboundFlight?.flight_no}</div>
                                </div>
                                <div className={styles.kv}>
                                    <div className={styles.k}>Seats left</div>
                                    <div className={styles.v}>{inboundFlight?.seats_left}</div>
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
                                    <div className={styles.k}>Aircraft</div>
                                    <div className={styles.v}>{inboundFlight?.aircraft}</div>
                                </div>
                            </div>
                                </div>
                            </>
                                    )}

                        <div className={styles.section}>
                            <h3>Price breakdown</h3>
                            <div className={styles.priceLines}>
                                <div className={styles.priceLine}>
                                    <span>Base fare</span>
                                    
                                    <span>{formatMoney(booking?.priceSummary?.baseFare,currency)}</span>
                                </div>
                                <div className={styles.priceLine}>
                                    <span>Taxes & fees</span>
                                    <span>{formatMoney(booking?.priceSummary?.taxesAndFees, currency)}</span>
                                </div>
                                <div className={styles.divider} />
                                <div className={`${styles.priceLine} ${styles.total}`}>
                                    <span>Total</span>
                                    <span>{formatMoney(total, currency)}</span>
                                </div>
                            </div>
                            <p className={`${styles.muted} ${styles.small}`}>
                                Demo note: passenger names and ticket numbers will be added later when the passenger
                                details page is implemented.<br/>
                                Hey {user.forename} {user.surname}! 😎
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