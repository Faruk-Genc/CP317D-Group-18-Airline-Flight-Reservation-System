import React, { useState } from "react";
import styles from "./CheckIn.module.css";

const featuredRoutes = [
  {
    from: "Toronto",
    to: "Tokyo",
    descEn:
      "Discover Japan with convenient non-stop options and competitive fares from our hub.",
  },
  {
    from: "New York",
    to: "Paris",
    descEn:
      "Experience Paris with flexible schedules and seamless connections across our network.",
  },
  {
    from: "London",
    to: "Dubai",
    descEn:
      "Fly to Dubai with award-winning service and real-time status updates for your journey.",
  },
];

const featuredImages = import.meta.glob(
  "../assets/featured/*.{jpg,jpeg,png,svg,webp}",
  { eager: true }
);

const imageMap = Object.keys(featuredImages).reduce((acc, path) => {
  const filename = path.split("/").pop();
  const key = filename.split(".")[0].toLowerCase().replace(/\s+/g, "");
  acc[key] = featuredImages[path].default;
  return acc;
}, {});

function resolveImage(from, to) {
  const fromKey = from.toLowerCase().replace(/\s+/g, "");
  const toKey = to.toLowerCase().replace(/\s+/g, "");
  return imageMap[toKey] ?? imageMap[fromKey];
}

const heroImages = import.meta.glob(
  "../assets/heropage/*.{jpg,jpeg,png,svg}",
  { eager: true }
);

const imageArray = Object.values(heroImages).map((module) => module.default);

function CheckIn({
  heroImage,
  onBook,
  onFlightStatus,
  onCheckIn,
  onMyFlights,
}) {
  const [bgImage] = useState(() => {
    const filtered = imageArray.filter((img) => img !== heroImage);
    if (filtered.length === 0) return imageArray[0];
    return filtered[Math.floor(Math.random() * filtered.length)];
  });

  const [flightNumber, setFlightNumber] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = () => {
    console.log("Searching for:", flightNumber, date);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className={styles["main-container"]}>
        <div className={styles.panel}>
          <div className={styles["input-container"]}>
            <div className={styles.fieldBlock}>
              <label className={styles.label}>Flight Number</label>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search airport, city, or country"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
              />
            </div>

            <div className={styles.fieldBlock}>
              <label className={styles.label}>Date</label>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="DD-MM-YYYY"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.searchWrap}>
            <button
              type="button"
              className={styles.searchBtn}
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <section className={styles.featuredSection}>
        <div className={styles.featured}>
          <h2 className={styles.featuredTitle}>Featured Popular Flights</h2>

          <div className={styles.cardRow}>
            {featuredRoutes.map((route) => {
              const img = resolveImage(route.from, route.to);

              return (
                <article
                  key={`${route.from}-${route.to}`}
                  className={styles.featureCard}
                >
                  <div
                    className={styles.featureImage}
                    style={img ? { backgroundImage: `url(${img})` } : undefined}
                  />
                  <div className={styles.featureBody}>
                    <h3 className={styles.featureHeadline}>
                      {route.from} → {route.to}
                    </h3>
                    <p className={styles.featureDesc}>{route.descEn}</p>
                    <button
                      type="button"
                      className={styles.bookLink}
                      onClick={onBook}
                    >
                      Book now
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default CheckIn;
