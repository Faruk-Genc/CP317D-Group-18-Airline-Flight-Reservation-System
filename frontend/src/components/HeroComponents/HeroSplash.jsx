import { useEffect, useRef } from "react";
import FlightCard from "../FlightCard/FlightCard";
import TripOptions from "../FlightCard/TripOptions";
import styles from "./HeroSplash.module.css";

export default function HeroSplash({
  heroImage,
  onSearch,
  search,
  tripOptions,
  setSearch,
  setTripOptions,
}) {
  const heroRef = useRef(null);

  const handleSearch = () => {
    onSearch?.({ search, tripOptions });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (scrollTop > 0) {
        heroRef.current.style.height = "600px";
      } else {
        heroRef.current.style.height = "100vh";
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className={styles.heroWrapper}>
      <section
        ref={heroRef}
        className={styles.heroSplashWrapper}
        style={{ transition: "height 0.7s ease" }}
      >
        <div className={styles.tripSearch} style={{ marginTop: "25vh" }}>
          <FlightCard
            iata1={search.from?.iata}
            city1={search.from?.city}
            iata2={search.to?.iata}
            city2={search.to?.city}
            onChange={(data) => setSearch({ ...search, ...data })}
          />

          <TripOptions
            passengers={tripOptions.passengers}
            travelType={tripOptions.tripType}
            cabinClass={tripOptions.cabinClass}
            departDate={search.departDate}
            returnDate={search.returnDate}
            onChange={(data) => {
              if ("departDate" in data || "returnDate" in data) {
                setSearch(data);
              } else {
                setTripOptions(data);
              }
            }}
            onSearch={handleSearch}
          />
        </div>

        <img className={styles.radial} src={heroImage} alt="Hero Background" />
        <img className={styles.heroSplash} src={heroImage} alt="Hero Foreground" />
      </section>
    </section>
  );
}