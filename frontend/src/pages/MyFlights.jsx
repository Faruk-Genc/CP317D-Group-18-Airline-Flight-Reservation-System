import { useMemo, useState } from "react";
import { useLang } from "../context/LangContext";
import styles from "./MyFlights.module.css";

const mockTrips = [
  {
    bookingNumber: "BK10293",
    city: "New York City",
    airport: "JFK",
    startDate: "2026-04-16",
    endDate: "2026-04-23",
    stops: 1,
    status: "upcoming",
    cabinClass: "Business",
    image: "",
  },
  {
    bookingNumber: "BK20814",
    city: "Tokyo",
    airport: "HND",
    startDate: "2026-05-02",
    endDate: "2026-05-11",
    stops: 0,
    status: "upcoming",
    cabinClass: "Economy",
    image: "",
  },
  {
    bookingNumber: "BK77821",
    city: "Vancouver",
    airport: "YVR",
    startDate: "2025-11-02",
    endDate: "2025-11-10",
    stops: 0,
    status: "past",
    cabinClass: "Premium Economy",
    image: "",
  },
  {
    bookingNumber: "BK55190",
    city: "Paris",
    airport: "CDG",
    startDate: "2025-09-14",
    endDate: "2025-09-22",
    stops: 1,
    status: "past",
    cabinClass: "Economy",
    image: "",
  },
];

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
  const { en } = useLang();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [query, setQuery] = useState("");

  const filteredTrips = useMemo(() => {
    return mockTrips.filter((trip) => {
      const isPast = new Date(trip.endDate) < new Date();
      const tripStatus = isPast ? "past" : "upcoming";

      const matchesTab = tripStatus === activeTab;
      const normalizedQuery = query.trim().toLowerCase();

      const matchesQuery =
        normalizedQuery === "" ||
        trip.bookingNumber.toLowerCase().includes(normalizedQuery) ||
        trip.city.toLowerCase().includes(normalizedQuery);

      return matchesTab && matchesQuery;
    });
  }, [activeTab, query]);

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            className={styles.tab}
            onClick={onBook}
          >
            {en ? "Book" : "Réserver"}
          </button>

          <button
            type="button"
            role="tab"
            className={styles.tab}
            onClick={onFlightStatus}
          >
            {en ? "Flight Status" : "Statut des vols"}
          </button>

          <button
            type="button"
            role="tab"
            className={styles.tab}
            onClick={onCheckIn}
          >
            {en ? "Check-in" : "Enregistrement"}
          </button>

          <button
            type="button"
            role="tab"
            className={`${styles.tab} ${styles.tabActive}`}
            aria-selected="true"
            onClick={onMyFlights}
          >
            {en ? "My Flights" : "Mes vols"}
          </button>
        </div>

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
                    {trip.image ? (
                      <img
                        src={trip.image}
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
                          {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                        </span>
                      </div>

                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>
                          {en ? "Stops" : "Escales"}
                        </span>
                        <span className={styles.detailValue}>
                          {trip.stops === 0
                            ? en
                              ? "Non-stop"
                              : "Direct"
                            : `${trip.stops} ${en ? "stop" : "escale"}${trip.stops > 1 ? "s" : ""}`}
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