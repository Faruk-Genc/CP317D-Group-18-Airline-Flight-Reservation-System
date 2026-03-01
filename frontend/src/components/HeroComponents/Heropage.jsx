import FlightCard from '../FlightCard/FlightCard';
import TripOptions from '../FlightCard/TripOptions';
import FeaturedFlights from "../FeaturedFlights/FeaturedFlights";
import HeroMessage from "./HeroMessage";
import "./Heropage.css";

export default function Heropage({ heroImage, onSearch, search, tripOptions, setSearch, setTripOptions }) {
  const handleSearch = () => {
    onSearch?.({ search, tripOptions });
  };

  return (
    <section className="hero-wrapper">
      <section className="hero-splash-wrapper">
        <div className="trip-search" style={{ marginTop: "150px" }}> 
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
              setTripOptions({ ...tripOptions, ...data });
              setSearch({
                ...search,
                departDate: data.departDate ?? search.departDate,
                returnDate: data.returnDate ?? search.returnDate,
              });
            }}
            onSearch={handleSearch}
          />
        </div>

        <img className="hero-splash radial" src={heroImage} alt="Hero" />
        <img className="hero-splash" src={heroImage} alt="Hero" />
      </section>

      <FeaturedFlights />
      <HeroMessage />
    </section>
  );
}