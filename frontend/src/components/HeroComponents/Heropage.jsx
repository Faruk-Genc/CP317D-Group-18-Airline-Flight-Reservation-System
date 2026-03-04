import FlightCard from "../FlightCard/FlightCard";
import TripOptions from "../FlightCard/TripOptions";
import FeaturedFlights from "../FeaturedFlights/FeaturedFlights";
import HeroMessage from "./HeroMessage";
import styles from "./Heropage.module.css";

export default function Heropage({
  heroImage,
  onSearch,
  search,
  tripOptions,
  setSearch,
  setTripOptions,
}) {
  const handleSearch = () => {
    onSearch?.({ search, tripOptions });
  };

  return (
    <section className={styles.heroWrapper}>
      <section className={styles.heroSplashWrapper}>
        <div className={styles.tripSearch} style={{ marginTop: "150px" }}>
          <FlightCard
            iata1={search.from?.iata}
            city1={search.from?.city}
            iata2={search.to?.iata}
            city2={search.to?.city}
            onChange={(data) =>
              setSearch({ ...search, ...data })
            }
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

        <img className={`${styles.heroSplash} ${styles.radial}`} src={heroImage} alt="Hero" />
        <img className={styles.heroSplash} src={heroImage} alt="Hero" />
      </section>

      <FeaturedFlights />
      <HeroMessage />
    </section>
  );
}