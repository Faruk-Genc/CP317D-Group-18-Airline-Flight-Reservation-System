import { useState } from "react";
import SearchResults from "../components/FlightCard/Search/SearchResults";
import { useLang } from "../context/LangContext";
import styles from "./FlightStatus.module.css";

function getStatus(flight) {
  const now = new Date();
  if (new Date(flight.arrival_time) < now)
    return <span className={styles.statusBadgeGray}>Arrived</span>;
  if (new Date(flight.departure_time) < now)
    return <span className={styles.statusBadgeYellow}>Departed</span>;
  return <span className={styles.statusBadge}>On Time</span>;
}

export default function FlightStatus() {
  const { en } = useLang();

  const [route, setRoute] = useState({
    from: { text: "", selected: null },
    to: { text: "", selected: null },
  });

  const [departureDate, setDepartureDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [flight_no, setFlightNo] = useState("");
  const [flights, setFlights] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);

    if (flight_no) {
      async function loadFlightsByNumber() {
        try {
          const res = await fetch(`/api/flights/${flight_no}`);
          const data = await res.json();
          setFlights(res.ok ? [data] : []);
        } catch (err) {
          console.error(err);
          setFlights([]);
        }
      }
      loadFlightsByNumber();
    } else {
      const origin =
        route.from?.selected?.origin_iata ?? route.from.text.trim().toUpperCase();
      const destination =
        route.to?.selected?.origin_iata ?? route.to.text.trim().toUpperCase();
      const params = new URLSearchParams({
        origin,
        destination,
        departure_date: departureDate,
      });

      async function loadFlights() {
        try {
          const res = await fetch(`/api/flights/search?${params}`);
          const data = await res.json();
          setFlights(res.ok ? data.outbound ?? [] : []);
        } catch (err) {
          console.error(err);
          setFlights([]);
        }
      }
      loadFlights();
    }
  };

  const handleSelect = (type, data) => {
    const label = data.isCountry
      ? data.origin_country
      : `${data.origin_city} (${data.origin_iata})`;
    setRoute((prev) => ({
      ...prev,
      [type]: { text: label, selected: data },
    }));
  };

  const handleFieldChange = (type, value) => {
    setRoute((prev) => ({
      ...prev,
      [type]: { text: value, selected: null },
    }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>
            {en ? "Flight Status" : "Statut de vol"}
          </h1>
          <p className={styles.subtitle}>
            {en
              ? "Check the latest flights between any two destinations and/or for a specific date."
              : "Vérifiez les derniers vols entre deux destinations et/ou pour une date spécifique."}
          </p>
        </div>

        <form onSubmit={handleSearch} noValidate>
          <div className={styles.formArea}>
            <div className={styles.formRow}>
              <div className={styles.columnFlight}>
                <div className={styles.hoverWrapper}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>
                      {en ? "From" : "De"}
                    </label>
                    <input
                      className={styles.fieldInput}
                      type="text"
                      autoComplete="off"
                      placeholder={en ? "Departing airport or city" : "Aéroport ou ville de départ"}
                      value={route.from.text}
                      onChange={(e) => handleFieldChange("from", e.target.value)}
                    />
                  </div>
                  {!route.from.selected && (
                    <div className={styles.searchDropdown}>
                      <SearchResults
                        width="100%"
                        height={200}
                        query={route.from.text}
                        onSelect={(data) => handleSelect("from", data)}
                      />
                    </div>
                  )}
                </div>

                <div className={styles.hoverWrapper}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>
                      {en ? "To" : "À"}
                    </label>
                    <input
                      className={styles.fieldInput}
                      type="text"
                      autoComplete="off"
                      placeholder={en ? "Arriving airport or city" : "Aéroport ou ville d'arrivée"}
                      value={route.to.text}
                      onChange={(e) => handleFieldChange("to", e.target.value)}
                    />
                  </div>
                  {!route.to.selected && (
                    <div className={styles.searchDropdown}>
                      <SearchResults
                        width="100%"
                        height={200}
                        query={route.to.text}
                        onSelect={(data) => handleSelect("to", data)}
                      />
                    </div>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    {en ? "Departure Date" : "Date de départ"}
                  </label>
                  <input
                    className={styles.fieldInput}
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                  />
                </div>
              </div>

              <h3 className={styles.divider} aria-hidden="true">
                {en ? "or" : "ou"}
              </h3>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  {en ? "Flight Number" : "Numéro de vol"}
                </label>
                <input
                  className={styles.fieldInput}
                  placeholder={en ? "e.g. AC123" : "ex. AC123"}
                  autoComplete="on"
                  name="flight_no"
                  type="text"
                  value={flight_no}
                  onChange={(e) => setFlightNo(e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </div>

          <div className={styles.searchWrap}>
            <button type="submit" className={styles.searchBtn}>
              {en ? "Search" : "Rechercher"}
            </button>
          </div>

          <div className={styles.resultList}>
            {searched && flights.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>{en ? "No flights found" : "Aucun vol trouvé"}</h3>
                <p>
                  {en
                    ? "Try a different route, date, or flight number."
                    : "Essayez un autre itinéraire, une autre date ou un autre numéro de vol."}
                </p>
              </div>
            ) : (
              flights.map((flight) => (
                <div key={flight.flight_no} className={styles.resultCard}>
                  <div className={styles.resultCardLeft}>
                    <strong>{flight.flight_no}</strong>
                    <div className={styles.route}>
                      <div>
                        <div className={styles.iataCode}>{flight.origin_iata}</div>
                        <div className={styles.cityName}>{flight.origin_city}</div>
                      </div>
                      <span className={styles.routeArrow}>✈</span>
                      <div>
                        <div className={styles.iataCode}>{flight.destination_iata}</div>
                        <div className={styles.cityName}>{flight.destination_city}</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.resultCardRight}>
                    <span className={styles.dateText}>
                      {new Date(flight.departure_time).toLocaleDateString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className={styles.timeText}>
                      {new Date(flight.departure_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {getStatus(flight)}
                  </div>
                </div>
              ))
            )}
          </div>
        </form>
      </div>
    </div>
  );
}