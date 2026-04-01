import { useState } from "react";
import FlightCard from "../components/FlightCard/FlightCard";
import FlightCardSelection from "../components/FlightCard/FlightCardSelection";
import { useLang } from "../context/LangContext";
import styles from "./FlightStatus.module.css";

const featuredRoutes = [
  {
    from: "Toronto",
    to: "Tokyo",
    fromFr: "Toronto",
    toFr: "Tokyo",
    descEn:
      "Discover Japan with convenient non-stop options and competitive fares from our hub.",
    descFr:
      "Découvrez le Japon avec des options pratiques et des tarifs compétitifs depuis notre hub.",
  },
  {
    from: "New York",
    to: "Paris",
    fromFr: "New York",
    toFr: "Paris",
    descEn:
      "Experience Paris with flexible schedules and seamless connections across our network.",
    descFr:
      "Découvrez Paris avec des horaires flexibles et des correspondances fluides sur notre réseau.",
  },
  {
    from: "London",
    to: "Dubai",
    fromFr: "Londres",
    toFr: "Dubaï",
    descEn:
      "Fly to Dubai with award-winning service and real-time status updates for your journey.",
    descFr:
      "Envolez-vous vers Dubaï avec un service primé et des mises à jour de statut en temps réel.",
  },
];

export default function FlightStatus({
  onBook,
  onCheckIn,
  onMyFlights,
}) {
  const { en } = useLang();

  const [route, setRoute] = useState({
    from: {
      iata: "YYZ",
      city: "Toronto",
    },
    to: {
      iata: "HND",
      city: "Tokyo",
    },
  });

  const [flightNumber, setFlightNumber] = useState("");
  const [flightDate, setFlightDate] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
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
              ? "Find and check the latest status of any flight."
              : "Trouvez et vérifiez l'état le plus récent de n'importe quel vol."}
          </p>
        </div>

        <form onSubmit={handleSearch} noValidate>
          <div className={styles.formArea}>
            <div className={styles.formRow}>

              {/* FROM (with dropdown overlay ONLY) */}
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
                      placeholder="IATA"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                    />
                  </div>

                  <div className={styles.dropdown}>
                    <FlightCardSelection
                      onSelect={(data) =>
                        setRoute((prev) => ({ ...prev, from: data }))
                      }
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
                      inputMode="numeric"
                      placeholder="IATA"
                      value={flightDate}
                      onChange={(e) => setFlightDate(e.target.value)}
                    />
                  </div>

                  <div className={styles.dropdown}>
                    <FlightCardSelection
                      onSelect={(data) =>
                        setRoute((prev) => ({ ...prev, to: data }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Divider (UNCHANGED) */}
              <h3 className={styles.divider} aria-hidden="true">
                {en ? "and/or" : "et/ou"}
              </h3>

              {/* Flight number + date (UNCHANGED) */}
              <div className={styles.columnFlight}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    {en ? "Flight Number" : "Numéro de vol"}
                  </label>

                  <input
                    className={styles.fieldInput}
                    type="text"
                    autoComplete="off"
                    placeholder={en ? "Flight Number" : "Numéro de vol"}
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    {en ? "Date" : "Date"}
                  </label>

                  <input
                    className={styles.fieldInput}
                    type="text"
                    inputMode="numeric"
                    placeholder="DD-MM-YYYY"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>

          <div className={styles.searchWrap}>
            {/* <button type="submit" className={styles.searchBtn}>
              {en ? "Search" : "Rechercher"}
            </button> */}
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