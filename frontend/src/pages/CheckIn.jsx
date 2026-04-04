import React, { useState } from "react";
import styles from "./CheckIn.module.css";
import { useLang } from "../context/LangContext";
import airports from "../../../scripts/flightgenerator/data/airports.json";

function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function AirportMap({ iata }) {
  const airport = airports[iata];
  if (!airport) return null;
  return (
    <iframe
      title={`map-${iata}`}
      width="100%"
      height="300"
      style={{ border: "none", borderRadius: "10px", marginTop: "16px", display: "block" }}
      src={`https://www.google.com/maps?q=${airport.lat},${airport.lon}&z=13&output=embed`}
    />
  );
}

function FlightCard({ leg, label, passengers, cabinType, en }) {
  const {
    flight_no,
    departure_time,
    arrival_time,
    origin_iata,
    origin_city,
    destination_iata,
    destination_city,
    aircraft,
    airline,
    gate,
  } = leg;

  return (
    <div className={styles.flightCard}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>{label}</span>
        <span className={styles.flightNo}>{flight_no}</span>
      </div>

      <div className={styles.routeRow}>
        <div className={styles.routeEndpoint}>
          <span className={styles.iataCode}>{origin_iata}</span>
          <span className={styles.cityName}>{origin_city}</span>
          <span className={styles.timeLabel}>{formatTime(departure_time)}</span>
          <span className={styles.dateLabel}>{formatDate(departure_time)}</span>
        </div>

        <div className={styles.routeMiddle}>
          <div className={styles.routeLine}>
            <span className={styles.planeDot}>✈</span>
          </div>
        </div>

        <div className={`${styles.routeEndpoint} ${styles.routeEndpointRight}`}>
          <span className={styles.iataCode}>{destination_iata}</span>
          <span className={styles.cityName}>{destination_city}</span>
          <span className={styles.timeLabel}>{formatTime(arrival_time)}</span>
          <span className={styles.dateLabel}>{formatDate(arrival_time)}</span>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.detailItem}>
          <span className={styles.detailKey}>{en ? "Airline" : "Compagnie"}</span>
          <span className={styles.detailVal}>{airline || "—"}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailKey}>{en ? "Aircraft" : "Appareil"}</span>
          <span className={styles.detailVal}>{aircraft || "—"}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailKey}>{en ? "Cabin" : "Cabine"}</span>
          <span className={styles.detailVal}>{cabinType || "Economy"}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailKey}>{en ? "Passengers" : "Passagers"}</span>
          <span className={styles.detailVal}>{passengers}</span>
        </div>
        {gate && (
          <div className={styles.detailItem}>
            <span className={styles.detailKey}>{en ? "Gate" : "Porte"}</span>
            <span className={styles.detailVal}>{gate}</span>
          </div>
        )}
      </div>

      <AirportMap iata={origin_iata} />
    </div>
  );
}

function CheckIn() {
  const { en } = useLang();

  const [reference, setReference] = useState("");
  const [lastName, setLastName] = useState("");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!reference || !lastName) {
      setError(en ? "Please fill in all fields." : "Veuillez remplir tous les champs.");
      return;
    }

    try {
      setError("");
      setBooking(null);

      const res = await fetch(
        `http://127.0.0.1:5000/api/checkin?booking_id=${reference}&last_name=${lastName}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || (en ? "Booking not found." : "Réservation introuvable."));
        return;
      }

      setBooking(data);
    } catch (err) {
      console.error(err);
      setError(en ? "Server error. Please try again." : "Erreur serveur. Veuillez réessayer.");
    }
  };

  const isRoundTrip = Boolean(booking?.returning_flight_no);

  const outboundLeg = booking
    ? {
        flight_no: booking.departing_flight_no,
        departure_time: booking.departure_time,
        arrival_time: booking.arrival_time,
        origin_iata: booking.origin_iata,
        origin_city: booking.origin_city,
        destination_iata: booking.destination_iata,
        destination_city: booking.destination_city,
        aircraft: booking.aircraft,
        airline: booking.airline,
        gate: booking.gate,
      }
    : null;

  const returnLeg = isRoundTrip
    ? {
        flight_no: booking.returning_flight_no,
        departure_time: booking.return_departure_time,
        arrival_time: booking.return_arrival_time,
        origin_iata: booking.return_origin_iata,
        origin_city: booking.return_origin_city,
        destination_iata: booking.return_destination_iata,
        destination_city: booking.return_destination_city,
        aircraft: booking.return_aircraft,
        airline: booking.return_airline,
        gate: booking.return_gate,
      }
    : null;

  const panelClass = [
    styles.panel,
    booking && !isRoundTrip ? styles.panelExpanded : "",
    booking && isRoundTrip ? styles.panelExpandedDouble : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.mainContainer}>
      <div className={panelClass}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>{en ? "Check In" : "Check-in"}</h1>
          <p className={styles.subtitle}>
            {en
              ? "Check-in is available starting 24 hours before your scheduled departure."
              : "Le check-in est disponible à partir de 24 heures avant votre départ prévu."}
          </p>
        </div>

        <div className={styles.inputContainer}>
          <div className={styles.fieldBlock}>
            <label className={styles.fieldLabel}>
              {en ? "Booking Reference" : "Référence de réservation"}
            </label>
            <input
              type="text"
              className={styles.searchInput}
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              placeholder="e.g. AB3K9ZXQ12"
            />
          </div>

          <div className={styles.fieldBlock}>
            <label className={styles.fieldLabel}>
              {en ? "Last Name" : "Nom de famille"}
            </label>
            <input
              type="text"
              className={styles.searchInput}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.searchWrap}>
          <button type="button" className={styles.searchBtn} onClick={handleSearch}>
            {en ? "Search" : "Rechercher"}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {booking && (
          <div className={styles.resultsSection}>
            <div className={styles.passengerBanner}>
              <div className={styles.passengerName}>
                {booking.forename} {booking.surname}
              </div>
              <div className={styles.bookingRef}>
                {en ? "Booking" : "Réservation"} · {booking.booking_id}
              </div>
              {isRoundTrip && (
                <span className={styles.tripBadge}>
                  {en ? "Round Trip" : "Aller-retour"}
                </span>
              )}
            </div>

            <div className={isRoundTrip ? styles.cardsRowDouble : styles.cardsRow}>
              <FlightCard
                leg={outboundLeg}
                label={isRoundTrip ? (en ? "Outbound" : "Aller") : (en ? "Flight" : "Vol")}
                passengers={booking.passengers}
                cabinType={booking.cabin_type}
                en={en}
              />
              {isRoundTrip && (
                <FlightCard
                  leg={returnLeg}
                  label={en ? "Return" : "Retour"}
                  passengers={booking.passengers}
                  cabinType={booking.cabin_type}
                  en={en}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckIn;