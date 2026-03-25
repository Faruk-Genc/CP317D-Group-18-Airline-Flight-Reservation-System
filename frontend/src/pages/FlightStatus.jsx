import { useState } from "react";
import FlightCard from "../components/FlightCard/FlightCard";
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

const images = import.meta.glob(
  "../assets/featured/*.{jpg,jpeg,png,svg,webp}",
  { eager: true }
);

const imageMap = Object.keys(images).reduce((acc, path) => {
  const filename = path.split("/").pop();
  const key = filename.split(".")[0].toLowerCase().replace(/\s+/g, "");
  acc[key] = images[path].default;
  return acc;
}, {});

function resolveImage(from, to) {
  const fromKey = from.toLowerCase().replace(/\s+/g, "");
  const toKey = to.toLowerCase().replace(/\s+/g, "");
  return imageMap[toKey] ?? imageMap[fromKey];
}

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
      isCountry: false,
      origin_country: "",
    },
    to: {
      iata: "HND",
      city: "Tokyo",
      isCountry: false,
      origin_country: "",
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
            className={`${styles.tab} ${styles.tabActive}`}
            aria-selected="true"
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
            className={styles.tab}
            onClick={onMyFlights}
          >
            {en ? "My Flights" : "Mes vols"}
          </button>
        </div>

        <form onSubmit={handleSearch} noValidate>
          <div className={styles.formArea}>
            <div className={styles.formRow}>
              <div className={styles.columnRoute}>
                <FlightCard
                  iata1={route.from.iata}
                  city1={route.from.city}
                  iata2={route.to.iata}
                  city2={route.to.city}
                  onChange={(data) =>
                    setRoute({ from: data.from, to: data.to })
                  }
                />
              </div>

              <div className={styles.divider} aria-hidden="true">
                {en ? "and/or" : "et/ou"}
              </div>

              <div className={styles.columnFlight}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="fs-flight-no">
                    {en ? "Flight Number" : "Numéro de vol"}
                  </label>
                  <input
                    id="fs-flight-no"
                    className={styles.fieldInput}
                    type="text"
                    autoComplete="off"
                    placeholder={en ? "Flight Number" : "Numéro de vol"}
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="fs-date">
                    {en ? "Date" : "Date"}
                  </label>
                  <input
                    id="fs-date"
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
            <button type="submit" className={styles.searchBtn}>
              {en ? "Search" : "Rechercher"}
            </button>
          </div>
        </form>
      </div>

      <section className={styles.featured} aria-labelledby="fs-featured-heading">
        <h2 id="fs-featured-heading" className={styles.featuredTitle}>
          {en ? "Featured Popular Flights" : "Vols populaires en vedette"}
        </h2>
        <div className={styles.cardRow}>
          {featuredRoutes.map((r) => {
            const img = resolveImage(r.from, r.to);
            const headline = en
              ? `${r.from} → ${r.to}`
              : `${r.fromFr ?? r.from} → ${r.toFr ?? r.to}`;
            return (
              <article key={`${r.from}-${r.to}`} className={styles.featureCard}>
                <div
                  className={styles.featureImage}
                  style={
                    img ? { backgroundImage: `url(${img})` } : undefined
                  }
                />
                <div className={styles.featureBody}>
                  <h3 className={styles.featureHeadline}>{headline}</h3>
                  <p className={styles.featureDesc}>
                    {en ? r.descEn : r.descFr}
                  </p>
                  <button
                    type="button"
                    className={styles.bookLink}
                    onClick={onBook}
                  >
                    {en ? "Book now" : "Réserver"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
