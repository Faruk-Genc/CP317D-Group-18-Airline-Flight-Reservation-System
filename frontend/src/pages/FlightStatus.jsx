import { useState } from "react";
import SearchResults from "../components/FlightCard/Search/SearchResults";
import { useLang } from "../context/LangContext";
import styles from "./FlightStatus.module.css";



export default function FlightStatus() {
  const { en } = useLang();

  const [route, setRoute] = useState({
    from: { text: "", selected: null },
    to: { text: "", selected: null },
  });

  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split("T")[0]);
  const [flight_no, setFlightNo] = useState("");
  const [flights, setFlights] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(route, departureDate, flight_no)

    if (flight_no) {
      async function loadFlightsByNumber() {
        try {
            const res = await fetch(`/api/flights/${flight_no}`)
            const data = await res.json();
          if (!res.ok) {
            setFlights([])
            return;
            }
            setFlights([data] ?? []);
            console.log("flight", data)
          }
          catch (err) {
          console.error(err)
          }
      }
      loadFlightsByNumber();
    }
      
    else {
      let origin = route.from?.selected?.origin_iata ?? route.from.text.trim().toUpperCase()
      let destination = route.to?.selected?.origin_iata ?? route.to.text.trim().toUpperCase()
      const params = new URLSearchParams({
        origin,
        destination,
        departure_date: departureDate,
      });
      async function loadFlights() {
        try {
          const res = await fetch(`/api/flights/search?${params}`);
          const data = await res.json();
          if (!res.ok) {
            setFlights([])
            return;
            }
          setFlights(data.outbound ?? []);
          console.log(flights)
        } catch (err) {
          console.error(err)
        }
      }
      loadFlights();
    }
  };

  const handleSelect = (type, data) => {
    const label = data.isCountry ? data.origin_country : data.origin_iata;
    setRoute((prev) => ({
      ...prev,
      [type]: {
        text: label,
        selected: data,
      },
    }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>
            {en ? "Flight Status" : "Statut"}
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
                      placeholder="Departing Airport"
                      value={route.from.text}
                      onChange={(e) =>
                        setRoute((prev) => ({
                          ...prev,
                          from: { text: e.target.value, selected: null },
                        }))
                      }
                    />
                  </div>
                  <div className={styles.searchDropdown}>
                    <SearchResults
                      width="100%"
                      height={200}
                      query={route.from.text}
                      onSelect={(data) => handleSelect("from", data)}
                    />
                  </div>
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
                      placeholder="Arriving Airport"
                      value={route.to.text}
                      onChange={(e) =>
                        setRoute((prev) => ({
                          ...prev,
                          to: { text: e.target.value, selected: null },
                        }))
                      }
                    />
                  </div>
                  <div className={styles.searchDropdown}>
                    <SearchResults
                      width="100%"
                      height={200}
                      query={route.to.text}
                      onSelect={(data) => handleSelect("to", data)}
                    />
                  </div>                  
                </div>
                <div className={styles.field}>
                  <label className = {styles.fieldLabel}>
                    {"Departure Date"}
                  </label>
                  <input 
                    className = {styles.fieldInput}
                    type="date"
                    value={departureDate}
                    onChange={(e) =>
                        setDepartureDate(e.target.value)
                      }
                  ></input>
                </div>

                

              </div>

              <h3 className={styles.divider} aria-hidden="true">
                {en ? "or" : "et/ou"}
              </h3>
              
              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  {"Flight Number"}
                </label>
                <input
                  className={styles.fieldInput}
                  placeholder="Enter a Flight Number"
                  autoComplete="on"
                  name = "flight_no"
                  type="text"
                  value = {flight_no}
                  onChange={(e) => 
                    setFlightNo(e.target.value)
                  }
                />
            </div>

              
            </div>
          </div>

          <div className={styles.searchWrap}>
            <button type="submit" className={styles.searchBtn}>
              {en ? "Search" : "Rechercher"}
            </button>

            
            
          </div>

          <div className = {styles.resultList}>

          {flights.length == 0 ? (
              <div className={styles.emptyState}>
                <h3>{en ? "No trips found" : "Aucun voyage trouvé"}</h3>
                <p>
                  {en
                    ? "Try a different booking number or city."
                    : "Essayez un autre numéro de réservation ou une autre ville."}
                </p>
              </div>) :
              (
                flights.map((flight) => (
                  <div
                    key={flight?.flight_no}
                    className={styles.resultCard}>
                      <div className= {styles.resultCardLeft}>
                        <strong>{flight.flight_no}</strong>
                        <span>{flight.origin_city} ({flight.origin_iata}) → {flight.destination_city} ({flight.destination_iata})</span>
                      </div>
                      
                      <div className={styles.resultCardRight}>
                        <span>{new Date(flight.departure_time).toLocaleDateString([], {
                                                                                        weekday: "long",
                                                                                        year: "numeric",
                                                                                        month: "long",
                                                                                        day: "numeric",
                                                                                      })}</span>
                        <span style={{ fontSize: "16px" }}><strong> {new Date(flight.departure_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong></span>
                      {(() => {
                        const now = new Date();
                        if (new Date(flight?.arrival_time) < now) return <span className={styles.statusBadge}>Arrived</span>;
                        if (new Date(flight?.departure_time) < now) return <span className={styles.statusBadgeYellow}>Departed</span>;
                        return <span className={styles.statusBadge}>On Time</span>;
                      })()}
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