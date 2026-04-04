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

function buildInitialPassengers(count, user) {
  return Array.from({ length: count }, (_, i) => {
    if (i === 0 && user) {
      return {
        firstName: user.forename ?? user.firstName ?? "",
        lastName: user.surname ?? user.lastName ?? "",
        isUnder18: false,
        phone: user.phone_number ?? user.phone ?? "",
        email: user.email ?? ""
      };
    }
    return { firstName: "", lastName: "", isUnder18: false, phone: "", email: "" };
  });
}

function validatePassengers(passengerData) {
  return passengerData.map((p) => {
    const errors = {};
    if (!p.firstName.trim()) errors.firstName = "Required";
    if (!p.lastName.trim()) errors.lastName = "Required";
    if (!p.isUnder18) {
      if (!p.phone.trim()) errors.phone = "Required";
      if (!p.email.trim()) errors.email = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) errors.email = "Invalid email";
    }
    return errors;
  });
}

function PassengerForm({ index, data, onChange, autoFilled, errors = {} }) {
  const label = index === 0 ? "Primary passenger" : `Passenger ${index + 1}`;

  const set = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    const updated = { ...data, [field]: value };
    if (field === "isUnder18" && value) {
      updated.phone = "";
      updated.email = "";
    }
    onChange(index, updated);
  };

  return (
    <div className={styles.passengerForm}>
      <div className={styles.passengerHeader}>
        <span className={styles.passengerLabel}>{label}</span>
        {autoFilled && (
          <span className={styles.autoFilledBadge}>Auto-filled from account</span>
        )}
      </div>

      <div className={styles.passengerFields}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            First name <span className={styles.req}>*</span>
          </label>
          <input
            className={`${styles.fieldInput} ${errors.firstName ? styles.inputError : ""}`}
            type="text"
            value={data.firstName}
            onChange={set("firstName")}
            placeholder="First name"
            disabled={autoFilled}
          />
          {errors.firstName && <span className={styles.fieldError}>{errors.firstName}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            Last name <span className={styles.req}>*</span>
          </label>
          <input
            className={`${styles.fieldInput} ${errors.lastName ? styles.inputError : ""}`}
            type="text"
            value={data.lastName}
            onChange={set("lastName")}
            placeholder="Last name"
            disabled={autoFilled}
          />
          {errors.lastName && <span className={styles.fieldError}>{errors.lastName}</span>}
        </div>

        <div className={styles.fieldGroupCheckbox}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={data.isUnder18}
              onChange={set("isUnder18")}
              className={styles.checkbox}
              disabled={autoFilled}
            />
            Under 18 years old
          </label>
        </div>

        <div className={`${styles.fieldGroup} ${data.isUnder18 ? styles.fieldDisabled : ""}`}>
          <label className={styles.fieldLabel}>
            Phone {!data.isUnder18 && <span className={styles.req}>*</span>}
          </label>
          <input
            className={`${styles.fieldInput} ${errors.phone ? styles.inputError : ""}`}
            type="tel"
            value={data.phone}
            onChange={set("phone")}
            placeholder="+1 (000) 000-0000"
            disabled={data.isUnder18 || autoFilled}
          />
          {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
        </div>

        <div className={`${styles.fieldGroup} ${data.isUnder18 ? styles.fieldDisabled : ""}`}>
          <label className={styles.fieldLabel}>
            Email {!data.isUnder18 && <span className={styles.req}>*</span>}
          </label>
          <input
            className={`${styles.fieldInput} ${errors.email ? styles.inputError : ""}`}
            type="email"
            value={data.email}
            onChange={set("email")}
            placeholder="email@example.com"
            disabled={data.isUnder18 || autoFilled}
          />
          {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
        </div>
      </div>
    </div>
  );
}


function PassengerCarousel({ passengerData, onChange, passengerErrors, submitted }) {
  const [active, setActive] = useState(0);

  const hasError = (i) =>
    submitted && passengerErrors[i] && Object.keys(passengerErrors[i]).length > 0;

  return (
    <div className={styles.passengerSection}>
      <div className={styles.passengerSectionTitle}>Passenger details</div>

      <div className={styles.passengerTabs}>
        {passengerData.map((_, i) => (
          <button
            key={i}
            type="button"
            className={[
              styles.passengerTab,
              active === i ? styles.passengerTabActive : "",
              hasError(i) ? styles.passengerTabError : ""
            ].join(" ")}
            onClick={() => setActive(i)}
          >
            {i === 0 ? "Primary" : `Passenger ${i + 1}`}
            {hasError(i) && <span className={styles.tabErrorDot} />}
          </button>
        ))}
      </div>

      <PassengerForm
        index={active}
        data={passengerData[active]}
        onChange={onChange}
        autoFilled={active === 0}
        errors={submitted ? (passengerErrors[active] ?? {}) : {}}
      />

      {passengerData.length > 1 && (
        <div className={styles.passengerNav}>
          <button
            type="button"
            className={styles.passengerNavBtn}
            onClick={() => setActive((p) => Math.max(0, p - 1))}
            disabled={active === 0}
          >
            ← Prev
          </button>
          <span className={styles.passengerNavCount}>
            {active + 1} / {passengerData.length}
          </span>
          <button
            type="button"
            className={styles.passengerNavBtn}
            onClick={() => setActive((p) => Math.min(passengerData.length - 1, p + 1))}
            disabled={active === passengerData.length - 1}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

const VIEW_PASSENGERS = "passengers";
const VIEW_FLIGHT = "flight";

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
  const [passengerData, setPassengerData] = useState(() =>
    buildInitialPassengers(passengers, user)
  );
  const [passengerErrors, setPassengerErrors] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [view, setView] = useState(passengers > 1 ? VIEW_PASSENGERS : VIEW_FLIGHT);

  useEffect(() => {
    setPassengerData(buildInitialPassengers(passengers, user));
  }, [passengers, user]);

  const handlePassengerChange = (index, updated) => {
    setPassengerData((prev) => prev.map((p, i) => (i === index ? updated : p)));
  };

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ flightId, startTime }));
    } else {
      startTime = stored.startTime;
    }
    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(TIMER_DURATION - elapsed, 0);
      setSecondsLeft(Math.floor(remaining / 1000));
      if (remaining <= 0) localStorage.removeItem(STORAGE_KEY);
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
          <button type="button" className={`${styles.reviewBtn} ${styles.secondary}`} onClick={onBack}>
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
    setSubmitted(true);
    if (passengers > 1) {
      const errors = validatePassengers(passengerData);
      setPassengerErrors(errors);
      if (errors.some((e) => Object.keys(e).length > 0)) {
        setView(VIEW_PASSENGERS);
        return;
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    onConfirm({ passengerData });
  };

  const showTabs = passengers > 1;
  const hasPassengerErrors = submitted && passengerErrors.some((e) => Object.keys(e).length > 0);

  return (
    <div className={styles.reviewPage}>
      <div className={styles.reviewTopbar}>
        <button type="button" className={`${styles.reviewBtn} ${styles.secondary}`} onClick={onBack}>
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

      {showTabs && (
        <div className={styles.viewTabs}>
          <button
            type="button"
            className={[
              styles.viewTab,
              view === VIEW_PASSENGERS ? styles.viewTabActive : "",
              hasPassengerErrors ? styles.viewTabError : ""
            ].join(" ")}
            onClick={() => setView(VIEW_PASSENGERS)}
          >
            {hasPassengerErrors && <span className={styles.tabErrorDotInline} />}
            Fill-out form
          </button>
          <button
            type="button"
            className={`${styles.viewTab} ${view === VIEW_FLIGHT ? styles.viewTabActive : ""}`}
            onClick={() => setView(VIEW_FLIGHT)}
          >
            Flight info &amp; checkout
          </button>
        </div>
      )}

      {showTabs && view === VIEW_PASSENGERS && (
        <div className={styles.reviewCard}>
          <PassengerCarousel
            passengerData={passengerData}
            onChange={handlePassengerChange}
            passengerErrors={passengerErrors}
            submitted={submitted}
          />
          <button
            type="button"
            className={`${styles.reviewBtn} ${styles.primary}`}
            onClick={() => {
              setSubmitted(true);
              const errors = validatePassengers(passengerData);
              setPassengerErrors(errors);
              if (errors.some((e) => Object.keys(e).length > 0)) return;
              setView(VIEW_FLIGHT);
            }}
          >
            Continue to checkout →
          </button>
          {submitted && hasPassengerErrors && (
            <p className={styles.expiredNote}>Please complete all required fields above.</p>
          )}
        </div>
      )}

      {(!showTabs || view === VIEW_FLIGHT) && (
        <div className={styles.reviewGrid}>
          <div className={styles.reviewCard}>
            {outboundFlight && (
              <>
                <div className={styles.flightMeta}>
                  <div><span className={styles.label}>Flight:</span> <b>{outboundFlight?.flight_no}</b></div>
                  <div><span className={styles.label}>Seats left:</span> {outboundFlight?.seats_left}</div>
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
                  <div><span className={styles.label}>Flight:</span> <b>{inboundFlight?.flight_no}</b></div>
                  <div><span className={styles.label}>Seats left:</span> {inboundFlight?.seats_left}</div>
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
                <span>Taxes &amp; fees</span>
                <span>{formatMoney(taxesAndFees * passengers, currency)}</span>
              </div>
              <div className={styles.divider} />
              <div className={`${styles.priceLine} ${styles.total}`}>
                <span>Total</span>
                <span>{formatMoney(baseFare + taxesAndFees * passengers, currency)}</span>
              </div>
            </div>

            {!user && (
              <button type="button" className={`${styles.reviewBtn} ${styles.primary}`} onClick={onSignIn}>
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

            {hasPassengerErrors && (
              <p className={styles.expiredNote}>
                Some passenger details are incomplete.{" "}
                <button type="button" className={styles.linkBtn} onClick={() => setView(VIEW_PASSENGERS)}>
                  Review passengers →
                </button>
              </p>
            )}

            {secondsLeft === 0 && (
              <p className={styles.expiredNote}>
                Your session expired. Please go back and re-select a flight.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}