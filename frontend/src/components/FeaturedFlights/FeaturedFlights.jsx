import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FeaturedFlightCard from "./FeaturedFlightCard";
import "./FeaturedFlights.css";

export default function FeaturedFlights() {
  const rowRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState([0, 0]);
  const scrollingRef = useRef(false); // track smooth scroll

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

  // Smooth scroll function
  const smoothScrollTo = (element, target, duration = 300, callback) => {
    scrollingRef.current = true;
    const start = element.scrollLeft;
    const change = target - start;
    const startTime = performance.now();

    const easeInOutQuad = (t) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      element.scrollLeft = start + change * easeInOutQuad(progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        scrollingRef.current = false;
        if (callback) callback();
      }
    };

    requestAnimationFrame(animate);
  };

  // Update visible range
  const updateVisibleCards = () => {
    const row = rowRef.current;
    if (!row) return;
    const cards = row.querySelectorAll(".featured-flight-card");
    if (!cards.length) return;

    let startIndex = 0;
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].offsetLeft + cards[i].offsetWidth > row.scrollLeft) {
        startIndex = i;
        break;
      }
    }

    let endIndex = startIndex;
    const rowRight = row.scrollLeft + row.clientWidth;
    for (let i = startIndex; i < cards.length; i++) {
      if (cards[i].offsetLeft < rowRight) {
        endIndex = i;
      } else break;
    }

    setVisibleRange([startIndex, endIndex]);
  };

  // Scroll one card left/right
  const scrollByOneCard = (direction) => {
    const row = rowRef.current;
    if (!row) return;
    const cards = row.querySelectorAll(".featured-flight-card");
    if (!cards.length) return;

    const gap = 16;
    const cardWidth = cards[0].offsetWidth + gap;
    const currentIndex = visibleRange[0];
    let newIndex =
      direction === "left" ? currentIndex - 1 : currentIndex + 1;
    newIndex = Math.max(0, Math.min(newIndex, cards.length - 1));

    const targetScrollLeft = newIndex * cardWidth;
    smoothScrollTo(row, targetScrollLeft, 300, updateVisibleCards);
  };

  // IntersectionObserver for manual scroll
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const cards = row.querySelectorAll(".featured-flight-card");
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return; // ignore while scrolling
        const visibleIndexes = [];
        entries.forEach((entry, idx) => {
          if (entry.isIntersecting) visibleIndexes.push(idx);
        });
        if (visibleIndexes.length) {
          setVisibleRange([
            Math.min(...visibleIndexes),
            Math.max(...visibleIndexes),
          ]);
        }
      },
      { root: row, threshold: 0.5 }
    );

    cards.forEach((card) => observer.observe(card));

    return () => cards.forEach((card) => observer.unobserve(card));
  }, []);

  // Handle resize to snap cards correctly
  useEffect(() => {
    const handleResize = () => {
      updateVisibleCards();
      const row = rowRef.current;
      if (!row) return;
      const cards = row.querySelectorAll(".featured-flight-card");
      if (!cards.length) return;

      const gap = 16;
      const cardWidth = cards[0].offsetWidth + gap;
      const targetScrollLeft = visibleRange[0] * cardWidth;
      smoothScrollTo(row, targetScrollLeft, 200); // snap after resize
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [visibleRange]);

  const leftDisabled = visibleRange[0] === 0;
  const rightDisabled = visibleRange[1] >= popularFlights.length - 1;

  return (
    <section className="featured-flights-container">
      <h2 className="featured-flights-heading">Popular Flights</h2>
      <div className="carousel-wrapper">
        <button
          className="arrow left"
          onClick={() => scrollByOneCard("left")}
          style={{
            opacity: leftDisabled ? 0.3 : 1,
            pointerEvents: leftDisabled ? "none" : "auto",
          }}
        >
          <ChevronLeft size={24} />
        </button>

        <div ref={rowRef} className="featured-flights-row">
          {popularFlights.map((flight, index) => (
            <FeaturedFlightCard
              key={index}
              from={flight.from}
              to={flight.to}
            />
          ))}
        </div>

        <button
          className="arrow right"
          onClick={() => scrollByOneCard("right")}
          style={{
            opacity: rightDisabled ? 0.3 : 1,
            pointerEvents: rightDisabled ? "none" : "auto",
          }}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="carousel-dots">
        {popularFlights.map((_, index) => {
          const isVisible =
            index >= visibleRange[0] && index <= visibleRange[1];
          return (
            <div
              key={index}
              className={`dot ${isVisible ? "active" : ""}`}
            />
          );
        })}
      </div>
    </section>
  );
}