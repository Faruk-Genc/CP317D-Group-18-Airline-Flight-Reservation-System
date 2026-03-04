import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FeaturedFlightCard from "./FeaturedFlightCard";
import styles from "./FeaturedFlights.module.css";
import { useLang } from "../../context/LangContext";

export default function FeaturedFlights() {
  const { en } = useLang(); 
  const rowRef = useRef(null);
  const [firstVisible, setFirstVisible] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  const popularFlights = [
    { from: "Toronto", to: "Tokyo" }, 
    { from: "New York", to: "Paris" },
    { from: "London", to: "Dubai", fromFr: "Londres", toFr: "Dubaï" },
    { from: "Sydney", to: "Los Angeles" }, 
    { from: "Bangkok", to: "Singapore", toFr: "Singapour" }, 
    { from: "Seoul", to: "Osaka", fromFr: "Séoul" }, 
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
      const scrollLeft = row.scrollLeft;
      const first = Math.round(scrollLeft / cardWidth);

      setVisibleCount(count);
      setFirstVisible(first);
    };

    update();

    const handleResize = () => {
      update();
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
    <section className={styles.featuredFlightsContainer}>
      <h2 className={styles.featuredFlightsHeading}>
        {en ? "Popular Flights" : "Vols populaires"}
      </h2>

      <div className={styles.carouselWrapper}>
        <button
          className={`${styles.arrow} ${styles.left}`}
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
          className={styles.featuredFlightsRow}
          style={{ scrollBehavior: "smooth" }}
        >
          {popularFlights.map((flight, idx) => (
            <FeaturedFlightCard
              key={idx}
              from={flight.from}      
              to={flight.to}          
              displayFrom={en ? flight.from : flight.fromFr ?? flight.from}
              displayTo={en ? flight.to : flight.toFr ?? flight.to}
            />
          ))}
        </div>

        <button
          className={`${styles.arrow} ${styles.right}`}
          onClick={() => scrollByOne("right")}
          style={{
            opacity: rightDisabled ? 0.3 : 1,
            pointerEvents: rightDisabled ? "none" : "auto",
          }}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className={styles.carouselDots}>
        {popularFlights.map((_, idx) => {
          const active = idx >= firstVisible && idx < firstVisible + visibleCount;
          return <div key={idx} className={`${styles.dot} ${active ? styles.active : ""}`} />;
        })}
      </div>

      <hr
        style={{
          border: "none",
          height: "2px",
          backgroundColor: "#f2f2f2",
          width: "60%",
          margin: "60px auto -60px",
        }}
      />
    </section>
  );
}