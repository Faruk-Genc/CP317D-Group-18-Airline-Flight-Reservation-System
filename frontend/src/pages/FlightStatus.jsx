import { useState } from "react";
import FlightCard from "../components/FlightCard/FlightCard";
import SearchResults from "../components/FlightCard/Search/SearchResults";
import FlightCardSelection from "../components/FlightCard/FlightCardSelection";
import { useLang } from "../context/LangContext";
import styles from "./FlightStatus.module.css";

export default function FlightStatus({
  onBook,
  onCheckIn,
  onMyFlights,
}) {
  const { en } = useLang();

  const [route, setRoute] = useState({
    from: {
      text: "",
      selected: null,
    },
    to: {
      text: "",
      selected: null,
    },
  });

  const [departureDate, setDepartureDate] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleSelect = (type, data) => {
    setRoute((prev) => ({
      ...prev,
      [type]: {
        text: data.label,
        selected: data,
      },
    }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>
            {en ? " Flight Status" : "Statut"}
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

                {/* FROM */}
                <div className={styles.hoverWrapper}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>
                      {en ? "From" : "De"}
                    </label>

                    <input
                      className={styles.fieldInput}
                      type="text"
                      autoComplete="off"
                      placeholder="IATA or Country"
                      value={route.from.text}
                      onChange={(e) =>
                        setRoute((prev) => ({
                          ...prev,
                          from: {
                            text: e.target.value,
                            selected: null,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className={styles.searchDropdown}>
                    <SearchResults
                      width={340}
                      height={200}
                      query={route.from.text}
                      onSelect={(data) =>
                        handleSelect("from", data)
                      }
                    />
                  </div>
                </div>

                {/* TO */}
                <div className={styles.hoverWrapper}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>
                      {en ? "To" : "À"}
                    </label>

                    <input
                      className={styles.fieldInput}
                      type="text"
                      autoComplete="off"
                      placeholder="IATA or Country"
                      value={route.to.text}
                      onChange={(e) =>
                        setRoute((prev) => ({
                          ...prev,
                          to: {
                            text: e.target.value,
                            selected: null,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className={styles.searchDropdown}>
                    <SearchResults
                      width={340}
                      height={200}
                      query={route.to.text}
                      onSelect={(data) =>
                        handleSelect("to", data)
                      }
                    />
                  </div>
                </div>

              </div>

              <h3 className={styles.divider} aria-hidden="true">
                {en ? "and/or" : "et/ou"}
              </h3>

              <div className={styles.columnFlight}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    {en ? "Departure" : "Départ"}
                  </label>

                  <input
                    className={styles.fieldInput}
                    type="date"
                    value={departureDate}
                    onChange={(e) =>
                      setDepartureDate(e.target.value)
                    }
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    {en ? "Return" : "Retour"}
                  </label>

                  <input
                    className={styles.fieldInput}
                    type="date"
                    value={arrivalDate}
                    onChange={(e) =>
                      setArrivalDate(e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.searchWrap}>
            <button type="submit" className={styles.searchBtn}>
              {en ? "Search" : "Rechercher"}
            </button>

            <div className={styles.emptyState}>
              <h3>{en ? "No trips found" : "Aucun voyage trouvé"}</h3>
              <p>
                {en
                  ? "Try a different booking number or city."
                  : "Essayez un autre numéro de réservation ou une autre ville."}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}