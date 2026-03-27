import { useMemo, useState, useEffect} from "react";
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



export default function MyFlights({
  onBook,
  onFlightStatus,
  onCheckIn,
  onMyFlights,
  onViewTrip,
  onManageBooking,
}) {
  const images = Object.values(
  import.meta.glob('../assets/featured/*', { eager: true, import: 'default' })
  );
  const getRandomImage = () => {
  return images[Math.floor(Math.random() * images.length)];
};
  const { user } = useUser();
  const [trips, setTrips] = useState([]);

  const { en } = useLang();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [query, setQuery] = useState("");
  useEffect(() => {
  if (!user) return;

  fetch(`/api/bookings/${user.id}`)
    .then(res => res.json())
    .then(setTrips)
    .catch(console.error);
}, [user]);

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
        raw: trip,
      };
      console.log(raw);
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
              className={`${styles.tripTab} ${activeTab === "upcoming" ? styles.tripTabActive : ""
                }`}
              onClick={() => setActiveTab("upcoming")}
            >
              {en ? "Upcoming" : "À venir"}
            </button>

            <button
              type="button"
              className={`${styles.tripTab} ${activeTab === "past" ? styles.tripTabActive : ""
                }`}
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
              filteredTrips.map((trip) => (
                <article
                  key={trip.bookingNumber}
                  className={styles.tripCard}
                >
                  <div className={styles.tripImageWrap}>
                    <div className={styles.tripImageWrap}>
                        <img
                          src={trip.image || getRandomImage()}
                          alt={trip.city}
                          className={styles.tripImage}
                        />
                      </div> (
                      <div className={styles.tripImageFallback}>
                        <span>{trip.city}</span>
                      </div>
                    )
                  </div>

                  <div className={styles.tripBody}>
                    <div className={styles.tripTop}>
                      <div>
                        <h2 className={styles.tripCity}>{trip.city}</h2>
                        <p className={styles.tripAirport}>{trip.airport}</p>
                      </div>

                      <span className={styles.tripBadge}>
                        {trip.status === "upcoming"
                          ? en
                            ? "Upcoming"
                            : "À venir"
                          : en
                            ? "Past"
                            : "Passé"}
                      </span>
                    </div>

                    <div className={styles.tripDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>
                          {en ? "Booking Reference" : "Référence"}                        </span>
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
                          {en ? "Passengers" : "Escales"}
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
                        onClick={() => onViewTrip?.(trip)}
                      >
                        {en ? "View trip" : "Voir le voyage"}
                      </button>

                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => onManageBooking?.(trip)}
                      >
                        {en ? "Manage booking" : "Gérer la réservation"}
                      </button>
                    </div>
                  </div>
                </article>
              ))
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