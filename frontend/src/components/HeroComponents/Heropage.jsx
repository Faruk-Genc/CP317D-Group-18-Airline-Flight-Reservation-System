// Heropage.jsx
import "./Heropage.css";
import FlightCard from '../FlightCard/FlightCard';
import TripOptions from '../FlightCard/TripOptions';
import FeaturedFlights from "../FeaturedFlights/FeaturedFlights";
import HeroMessage from "./HeroMessage";

export default function Heropage({ heroImage }) {
  return (
    <section className="hero-wrapper">
      <section className="hero-splash-wrapper">
        <div className="trip-search" style={{ marginTop: "200px" }}> 
          <FlightCard iata1="YYZ" city1="Toronto" iata2="HND" city2="Tokyo" />
          <TripOptions />
        </div>

        <img className="hero-splash radial" src={heroImage} alt="Hero" />
        <img className="hero-splash" src={heroImage} alt="Hero" />
      </section>

      <FeaturedFlights />
      <HeroMessage />
    </section>
  );
}