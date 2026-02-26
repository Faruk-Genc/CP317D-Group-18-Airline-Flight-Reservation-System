import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FeaturedFlightCard from "./FeaturedFlightCard";
import "./FeaturedFlights.css";

export default function FeaturedFlights() {
  const rowRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState([0, 0]);

  const popularFlights = [
    { from: "Toronto", to: "Tokyo" },
    { from: "New York", to: "Paris" },
    { from: "London", to: "Dubai" },
    { from: "Sydney", to: "Los Angeles" },
    { from: "Bangkok", to: "Singapore" },
    { from: "Seoul", to: "Osaka" },
    { from: "Toronto", to: "New York" },
    { from: "Osaka", to: "Tokyo" }
  ];

  const scrollByOneCard = (direction) => {
    const row = rowRef.current;
    if (!row) return;

    const cards = row.querySelectorAll(".featured-flight-card");
    if (!cards.length) return;

    let index = visibleRange[0];
    index = direction === "left" ? index - 1 : index + 1;
    index = Math.max(0, Math.min(index, cards.length - 1));

    cards[index].scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest"
    });
  };

  const updateVisibleCards = () => {
    const row = rowRef.current;
    if (!row) return;

    const cards = row.querySelectorAll(".featured-flight-card");
    if (!cards.length) return;

    let startIndex = 0;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (card.offsetLeft + card.offsetWidth / 2 >= row.scrollLeft) {
        startIndex = i;
        break;
      }
    }

    const cardsPerView = Math.ceil(row.clientWidth / (cards[0].offsetWidth + 16));
    const endIndex = startIndex + cardsPerView - 1;
    setVisibleRange([startIndex, Math.min(endIndex, cards.length - 1)]);
  };

  useEffect(() => {
    updateVisibleCards();
    const row = rowRef.current;
    row.addEventListener("scroll", updateVisibleCards);
    window.addEventListener("resize", updateVisibleCards);

    return () => {
      row.removeEventListener("scroll", updateVisibleCards);
      window.removeEventListener("resize", updateVisibleCards);
    };
  }, []);

  const leftDisabled = visibleRange[0] === 0;
  const rightDisabled = visibleRange[1] >= popularFlights.length - 1;

  return (
    <section className="featured-flights-container">
      <h2 className="featured-flights-heading">Popular Flights</h2>
      <div className="carousel-wrapper">
        <button
          className="arrow left"
          onClick={() => scrollByOneCard("left")}
          style={{ opacity: leftDisabled ? 0.3 : 1, pointerEvents: leftDisabled ? "none" : "auto" }}
        >
          <ChevronLeft className="arrow" size={24} />
        </button>
        <div ref={rowRef} className="featured-flights-row">
          {popularFlights.map((flight, index) => (
            <FeaturedFlightCard key={index} from={flight.from} to={flight.to} />
          ))}
        </div>
        <button
          className="arrow right"
          onClick={() => scrollByOneCard("right")}
          style={{ opacity: rightDisabled ? 0.3 : 1, pointerEvents: rightDisabled ? "none" : "auto" }}
        >
          <ChevronRight className="arrow" size={24} />
        </button>
      </div>
      <div className="carousel-dots">
        {popularFlights.map((_, index) => {
          const isVisible = index >= visibleRange[0] && index <= visibleRange[1];
          return <div key={index} className={`dot ${isVisible ? "active" : ""}`} />;
        })}
      </div>
    </section>
  );
}