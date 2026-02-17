import FeaturedFlightCard from "./FeaturedFlightCard";
import "./FeaturedFlights.css";

export default function FeaturedFlights() {
  const popularFlights = [
    { from: "Toronto", to: "Tokyo" },
    { from: "New York", to: "Paris" },
    { from: "London", to: "Dubai" },
    { from: "Sydney", to: "Los Angeles" },
  ];

  return (
    <section className="featured-flights-container">
      <h2>Popular Flights</h2>

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
