import { useState } from "react";
import "./Heropage.css";
import FlightCard from '../FlightCard/FlightCard';
import TripOptions from '../FlightCard/TripOptions';
import FeaturedFlights from "../FeaturedFlights/FeaturedFlights";
import HeroMessage from "./HeroMessage";

export default function Heropage({ heroImage, onSearch }) {

  const [search, setSearch] = useState({
    from: null,
    to: null,
    departDate: null,
    returnDate: null,
  });

  const [tripOptions, setTripOptions] = useState({
    passengers: 1,
    tripType: "round-trip",
    cabinClass: "economy",
  });

  const handleSearch = () => {
    onSearch?.({
      search,
      tripOptions,
    });
  };

  return (
    <section className="hero-wrapper">
      <section className="hero-splash-wrapper">
        <div className="trip-search" style={{ marginTop: "200px" }}> 
          <FlightCard
  iata1="YYZ"
  city1="Toronto"
  iata2="HND"
  city2="Tokyo"
  onChange={(data) => setSearch((prev) => ({ ...prev, ...data }))}
 />
<TripOptions
  onChange={(data) => {
    // data includes passengers, tripType, cabinClass, departDate, returnDate
    setTripOptions((prev) => ({
      ...prev,
      passengers: data.passengers ?? prev.passengers,
      tripType: data.tripType ?? prev.tripType,
      cabinClass: data.cabinClass ?? prev.cabinClass,
    }));

    // dates belong in search
    setSearch((prev) => ({
      ...prev,
      departDate: data.departDate ?? prev.departDate,
      returnDate: data.returnDate ?? prev.returnDate,
    }));
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