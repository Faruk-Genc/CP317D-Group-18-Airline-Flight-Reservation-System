import FeaturedFlightCard from "./FeaturedFlightCard";
import "./FeaturedFlights.css";
import heroImage from "../../assets/svg-art/world-map.svg";

export default function FeaturedFlights() {
  const popularFlights = [
    { from: "Toronto", to: "Tokyo" },
    { from: "New York", to: "Paris" },
    { from: "London", to: "Dubai" },
    { from: "Sydney", to: "Los Angeles" },
    { from: "Bangkok", to: "Singapore" },
    { from: "Seoul", to: "Osaka" }
  ];

  return (
    <section className="featured-flights-container">
      <h2 className="featured-flights-heading">Popular Flights</h2>

      <div className="featured-flights-row">
        {popularFlights.map((flight, index) => (
          <FeaturedFlightCard
            key={index}
            from={flight.from}
            to={flight.to}
          />
        ))}
      </div>
    </section>
  );
}
