import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FeaturedFlightCard from "./FeaturedFlightCard";
import "./FeaturedFlights.css";

export default function FeaturedFlights() {
  const rowRef = useRef(null);
  const [firstVisible, setFirstVisible] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  const popularFlights = [
    { from: "Toronto", to: "Tokyo" },
    { from: "New York", to: "Paris" },
    { from: "London", to: "Dubai" },
    { from: "Sydney", to: "Los Angeles" },
    { from: "Bangkok", to: "Singapore" },
    { from: "Seoul", to: "Osaka" },
    { from: "Toronto", to: "New York" },
    { from: "Osaka", to: "Tokyo" },
  ];

  const scrollToIndex = (index, behavior = "smooth") => {
    const row = rowRef.current;
    if (!row) return;
    const card = row.children[index];
    if (!card) return;

    row.scrollTo({
      left: card.offsetLeft,
      behavior,
    });
  };

  const scrollByOne = (direction) => {
    const newIndex =
      direction === "left"
        ? Math.max(0, firstVisible - 1)
        : Math.min(popularFlights.length - visibleCount, firstVisible + 1);

    scrollToIndex(newIndex);
  };

  useEffect(() => {
    const row = rowRef.current;
    if (!row || row.children.length === 0) return;

    const update = () => {
      const cardWidth = row.children[0].offsetWidth;
      const containerWidth = row.offsetWidth;

      const count = Math.floor(containerWidth / cardWidth) || 1;

      // keep the current firstVisible card in view
      const scrollLeft = row.scrollLeft;
      const first = Math.round(scrollLeft / cardWidth);

      setVisibleCount(count);
      setFirstVisible(first);
    };

    // Initial update
    update();

    const handleResize = () => {
      update();
      // ensure the first visible card stays aligned
      scrollToIndex(firstVisible, "auto");
    };

    row.addEventListener("scroll", update);
    window.addEventListener("resize", handleResize);

    return () => {
      row.removeEventListener("scroll", update);
      window.removeEventListener("resize", handleResize);
    };
  }, [firstVisible, popularFlights.length]);

  const leftDisabled = firstVisible === 0;
  const rightDisabled = firstVisible + visibleCount >= popularFlights.length;

  return (
    <section className="featured-flights-container">
      <h2 className="featured-flights-heading">Popular Flights</h2>

      <div className="carousel-wrapper">
        <button
          className="arrow left"
          onClick={() => scrollByOne("left")}
          style={{
            opacity: leftDisabled ? 0.3 : 1,
            pointerEvents: leftDisabled ? "none" : "auto",
          }}
        >
          <ChevronLeft size={24} />
        </button>

        <div
          ref={rowRef}
          className="featured-flights-row"
          style={{ scrollBehavior: "smooth" }}
        >
          {popularFlights.map((flight, idx) => (
            <FeaturedFlightCard key={idx} from={flight.from} to={flight.to} />
          ))}
        </div>

        <button
          className="arrow right"
          onClick={() => scrollByOne("right")}
          style={{
            opacity: rightDisabled ? 0.3 : 1,
            pointerEvents: rightDisabled ? "none" : "auto",
          }}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="carousel-dots">
        {popularFlights.map((_, idx) => {
          const active = idx >= firstVisible && idx < firstVisible + visibleCount;
          return <div key={idx} className={`dot ${active ? "active" : ""}`} />;
        })}
      </div>
    </section>
  );
}