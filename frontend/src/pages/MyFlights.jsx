import { useMemo, useState, useEffect } from "react";
import { useLang } from "../context/LangContext";
import styles from "./MyFlights.module.css";
import { useUser } from "../context/UserContext";


function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}


const imageModules = import.meta.glob('/src/assets/city_images/*.{jpeg,jpg,png}', {
  eager: true,
  import: 'default'
});

const imageMap = Object.fromEntries(
  Object.entries(imageModules).map(([path, src]) => {
    const filename = path
      .split("/")
      .pop()
      .replace(/\.(jpeg|jpg|png)$/i, "");
    return [filename.toLowerCase(), src];
  })
);

const getImage = (city) => {
  if (!city) return null;
  const key = city.trim().toLowerCase();
  return imageMap[key] || null;
};


export default function MyFlights({
  onBook,
  onFlightStatus,
  onCheckIn,
  onMyFlights,
  onViewTrip,
  onManageBooking,
}) {
  const { user } = useUser();
  const [trips, setTrips] = useState([]);
  const { en } = useLang();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [query, setQuery] = useState("");
  const [expandedTrips, setExpandedTrips] = useState(new Set());

  useEffect(() => {
    if (!user) return;
    fetch(`/api/bookings/${user.id}`)
      .then(res => res.json())
      .then(setTrips)
      .catch(console.error);
  }, [user]);

  const toggleTrip = (bookingNumber) => {
    setExpandedTrips(prev => {
      const next = new Set(prev);
      next.has(bookingNumber) ? next.delete(bookingNumber) : next.add(bookingNumber);
      return next;
    });
  };

  const cancelBooking = async (bookingId) => {
    const confirmed = window.confirm("Cancel this flight?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      setTrips(prev => prev.filter(t => t.booking_id !== bookingId));
    } catch (err) {
      console.error(err);
      alert("Cancel failed: " + err.message);
    }
  };

  const filteredTrips = useMemo(() => {
    return trips
      .map((trip) => {
        const isPast = new Date(trip.departure_time) < new Date();
        const isRoundTrip = !!trip.return_time;
        return {
          bookingNumber: trip.booking_id,
          city: trip.destination_city,
          airport: trip.destination_iata,
          startDate: trip.departure_time,
          endDate: trip.return_time || null,
          type: isRoundTrip ? "round-trip" : "one-way",
          status: isPast ? "past" : "upcoming",
          cabinClass: trip.cabin_type || "Economy",
          passengers: trip.passengers,
          flightNumber: trip.flight_number || null,
          aircraft: trip.aircraft || null,
          originIata: trip.origin_iata || null,
          originCity: trip.origin_city || null,
          arrivalTime: trip.arrival_time || null,
          returnArrivalTime: trip.return_arrival_time || null,
          seatNumbers: trip.seat_numbers || null,
          passengerNames: trip.passenger_names || null,
          terminal: trip.terminal || null,
          gate: trip.gate || null,
          raw: trip,
        };
      })
      .filter((trip) => {
        const matchesTab = trip.status === activeTab;
        const q = query.toLowerCase();
        return (
          matchesTab &&
          (q === "" ||
            trip.bookingNumber.toLowerCase().includes(q) ||
            trip.city.toLowerCase().includes(q))
        );
      });
  }, [trips, activeTab, query]);

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.content}>
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>{en ? "Trips" : "Voyages"}</h1>
              <p className={styles.subtitle}>
                {en
                  ? "View and manage your upcoming and past bookings."
                  : "Consultez et gérez vos réservations à venir et passées."}
              </p>
            </div>
          </div>

          <div className={styles.tripTabs}>
            <button
              type="button"
              className={`${styles.tripTab} ${activeTab === "upcoming" ? styles.tripTabActive : ""}`}
              onClick={() => setActiveTab("upcoming")}
            >
              {en ? "Upcoming" : "À venir"}
            </button>
            <button
              type="button"
              className={`${styles.tripTab} ${activeTab === "past" ? styles.tripTabActive : ""}`}
              onClick={() => setActiveTab("past")}
            >
              {en ? "Past" : "Passés"}
            </button>
          </div>

          <div className={styles.searchWrap}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={
                en
                  ? "Search by booking number or city"
                  : "Rechercher par numéro de réservation ou ville"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className={styles.tripList}>
            {filteredTrips.length > 0 ? (
              filteredTrips.map((trip) => {
                const isExpanded = expandedTrips.has(trip.bookingNumber);
                return (
                  <article key={trip.bookingNumber} className={styles.tripCard}>

                    <div className={styles.tripImageWrap}>
                      {getImage(trip.city) ? (
                        <img
                          src={getImage(trip.city)}
                          alt={trip.city}
                          className={styles.tripImage}
                        />
                      ) : (
                        <div className={styles.tripImageFallback}>
                          <span>{trip.city}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.tripBody}>
                      <div className={styles.tripTop}>
                        <div>
                          <h2 className={styles.tripCity}>{trip.city}</h2>
                          <p className={styles.tripAirport}>{trip.airport}</p>
                        </div>
                        <span className={styles.tripBadge}>
                          {trip.status === "upcoming"
                            ? en ? "Upcoming" : "À venir"
                            : en ? "Past" : "Passé"}
                        </span>
                      </div>

                      <div className={styles.tripDetails}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>
                            {en ? "Booking Reference" : "Référence"}
                          </span>
                          <span className={styles.detailValue}>
                            {trip.bookingNumber}
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>
                            {en ? "Dates" : "Dates"}
                          </span>
                          <span className={styles.detailValue}>
                            {trip.endDate
                              ? `${formatDate(trip.startDate)} — ${formatDate(trip.endDate)}`
                              : formatDate(trip.startDate)}
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>
                            {en ? "Passengers" : "Passagers"}
                          </span>
                          <span className={styles.detailValue}>
                            {trip.passengers}
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>
                            {en ? "Cabin" : "Cabine"}
                          </span>
                          <span className={styles.detailValue}>
                            {trip.cabinClass}
                          </span>
                        </div>
                      </div>

                      <div className={styles.tripActions}>
                        <button
                          type="button"
                          className={styles.primaryBtn}
                          onClick={() => toggleTrip(trip.bookingNumber)}
                        >
                          {isExpanded
                            ? en ? "Hide trip" : "Masquer"
                            : en ? "View trip" : "Voir le voyage"}
                        </button>
                        <button
                          type="button"
                          className={styles.secondaryBtn}
                          onClick={() => onManageBooking?.(trip)}
                        >
                          {en ? "Manage booking" : "Gérer la réservation"}
                        </button>
                        <button
                          type="button"
                          className={styles.secondaryBtn}
                          onClick={() => cancelBooking(trip.bookingNumber)}
                        >
                          {en ? "Cancel" : "Annuler"}
                        </button>
                      </div>

                      {/* Expandable trip detail section */}
                      <div className={`${styles.expandSection} ${isExpanded ? styles.expandOpen : ""}`}>
                        <div className={styles.expandInner}>

                          <div className={styles.expandStatusRow}>
                            <span className={styles.statusPill}>
                              <span className={styles.statusDot} />
                              {en ? "Confirmed" : "Confirmé"}
                            </span>
                          </div>

                          {/* Outbound flight */}
                          <p className={styles.expandSectionTitle}>
                            {en ? "Outbound flight" : "Vol aller"}
                          </p>
                          <div className={styles.expandGrid}>
                            <div className={styles.expandCard}>
                              <div className={styles.expandCardLabel}>
                                {en ? "Departure" : "Départ"}
                              </div>
                              <div className={styles.expandCardValue}>
                                {trip.originIata ?? "—"} → {trip.airport}
                              </div>
                              <div className={styles.expandCardSub}>
                                {formatDate(trip.startDate)} · {formatTime(trip.startDate)}
                              </div>
                            </div>
                            <div className={styles.expandCard}>
                              <div className={styles.expandCardLabel}>
                                {en ? "Arrival" : "Arrivée"}
                              </div>
                              <div className={styles.expandCardValue}>
                                {trip.airport}{trip.terminal ? ` · ${en ? "Terminal" : "Terminal"} ${trip.terminal}` : ""}
                              </div>
                              <div className={styles.expandCardSub}>
                                {trip.arrivalTime ? `${formatDate(trip.arrivalTime)} · ${formatTime(trip.arrivalTime)}` : "—"}
                              </div>
                            </div>
                            <div className={styles.expandCard}>
                              <div className={styles.expandCardLabel}>
                                {en ? "Flight" : "Vol"}
                              </div>
                              <div className={styles.expandCardValue}>
                                {trip.flightNumber ?? "—"}
                              </div>
                              <div className={styles.expandCardSub}>
                                {trip.aircraft ?? (en ? "Aircraft TBD" : "Appareil TBD")}
                              </div>
                            </div>
                            <div className={styles.expandCard}>
                              <div className={styles.expandCardLabel}>
                                {en ? "Gate" : "Porte"}
                              </div>
                              <div className={styles.expandCardValue}>
                                {trip.gate ?? (en ? "TBD" : "TBD")}
                              </div>
                              <div className={styles.expandCardSub}>
                                {en ? "Check back closer to departure" : "Vérifiez avant le départ"}
                              </div>
                            </div>
                          </div>

                          {trip.endDate && (
                            <>
                              <p className={styles.expandSectionTitle}>
                                {en ? "Return flight" : "Vol retour"}
                              </p>
                              <div className={styles.expandGrid}>
                                <div className={styles.expandCard}>
                                  <div className={styles.expandCardLabel}>
                                    {en ? "Departure" : "Départ"}
                                  </div>
                                  <div className={styles.expandCardValue}>
                                    {trip.airport} → {trip.originIata ?? "—"}
                                  </div>
                                  <div className={styles.expandCardSub}>
                                    {formatDate(trip.endDate)} · {formatTime(trip.endDate)}
                                  </div>
                                </div>
                                <div className={styles.expandCard}>
                                  <div className={styles.expandCardLabel}>
                                    {en ? "Arrival" : "Arrivée"}
                                  </div>
                                  <div className={styles.expandCardValue}>
                                    {trip.originIata ?? "—"}
                                  </div>
                                  <div className={styles.expandCardSub}>
                                    {trip.returnArrivalTime
                                      ? `${formatDate(trip.returnArrivalTime)} · ${formatTime(trip.returnArrivalTime)}`
                                      : "—"}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          <p className={styles.expandSectionTitle}>
                            {en ? "Passengers" : "Passagers"}
                          </p>
                          <div className={styles.expandGrid}>
                            {trip.passengerNames && trip.passengerNames.length > 0
                              ? trip.passengerNames.map((name, i) => (
                                <div key={i} className={styles.expandCard}>
                                  <div className={styles.expandCardLabel}>
                                    {en ? `Passenger ${i + 1}` : `Passager ${i + 1}`}
                                  </div>
                                  <div className={styles.expandCardValue}>{name}</div>
                                  <div className={styles.expandCardSub}>
                                    {trip.seatNumbers?.[i]
                                      ? `${en ? "Seat" : "Siège"} ${trip.seatNumbers[i]}`
                                      : en ? "Seat not assigned" : "Siège non assigné"}
                                  </div>
                                </div>
                              ))
                              : Array.from({ length: trip.passengers }, (_, i) => (
                                <div key={i} className={styles.expandCard}>
                                  <div className={styles.expandCardLabel}>
                                    {en ? `Passenger ${i + 1}` : `Passager ${i + 1}`}
                                  </div>
                                  <div className={styles.expandCardValue}>—</div>
                                  <div className={styles.expandCardSub}>
                                    {en ? "Seat not assigned" : "Siège non assigné"}
                                  </div>
                                </div>
                              ))}
                          </div>

                        </div>
                      </div>
                      {/* End expandable section */}

                    </div>
                  </article>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <h3>{en ? "No trips found" : "Aucun voyage trouvé"}</h3>
                <p>
                  {en
                    ? "Try a different booking number or city."
                    : "Essayez un autre numéro de réservation ou une autre ville."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}