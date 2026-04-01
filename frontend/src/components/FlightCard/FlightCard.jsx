import { useState, useEffect, useRef } from "react";
import { ArrowLeftRight } from "lucide-react";
import SearchBox from "./Search/SearchBox";
import SearchResults from "./Search/SearchResults";
import styles from "./FlightCard.module.css";
import airportsData from "../../../../scripts/flightgenerator/data/airports.json";
import countriesData from "../../../../scripts/flightgenerator/data/countries.json";

export default function FlightCard({ iata1, city1, isCountry1, country1, iata2, city2, isCountry2, country2, onChange }) {
  const [from, setFrom] = useState({
    iata: iata1 || "",
    city: city1 || "",
    isCountry: isCountry1 || false,
    origin_country: country1 || "",
  });
  const [to, setTo] = useState({
    iata: iata2 || "",
    city: city2 || "",
    isCountry: isCountry2 || false,
    origin_country: country2 || "",
  });
  const [rotated, setRotated] = useState(false);

  useEffect(() => {
    onChange?.({ from, to });
  }, [from, to]);

  const swapCards = () => {
    setRotated((prev) => !prev);
    setFrom((prevFrom) => {
      setTo(prevFrom);
      return to;
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Card
          iata={from.iata}
          city={from.city}
          isCountry={from.isCountry}
          country={from.origin_country}
          onSelect={(o) =>
            setFrom({
              iata: o.origin_iata,
              city: o.origin_city,
              isCountry: o.isCountry,
              origin_country: o.origin_country,
            })
          }
        />
        <Card
          iata={to.iata}
          city={to.city}
          isCountry={to.isCountry}
          country={to.origin_country}
          onSelect={(o) =>
            setTo({
              iata: o.origin_iata,
              city: o.origin_city,
              isCountry: o.isCountry,
              origin_country: o.origin_country,
            })
          }
        />
      </div>
      <button className={styles.switch} onClick={swapCards}>
        <ArrowLeftRight size={24} className={rotated ? styles.rotated : ""} />
      </button>
    </div>
  );
}

function Card({ iata, city, onSelect, isCountry, country }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const cardRef = useRef(null);

  // Rich query logic from FlightCardSelection
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const lowerQuery = query.toLowerCase();

    const matchedCountryEntries = Object.entries(countriesData).filter(
      ([code, countryName]) => countryName.toLowerCase().includes(lowerQuery)
    );

    const countryResults = matchedCountryEntries.map(([code, countryName]) => ({
      origin_iata: code,
      origin_city: "",
      origin_country: countryName,
      isCountry: true,
    }));

    const airportResults = Object.entries(airportsData)
      .filter(([iata, airport]) => {
        const countryName = countriesData[airport.country] || "";
        if (matchedCountryEntries.some(([code]) => airport.country === code))
          return true;
        return (
          iata.toLowerCase().includes(lowerQuery) ||
          airport.city.toLowerCase().includes(lowerQuery) ||
          airport.name.toLowerCase().includes(lowerQuery) ||
          countryName.toLowerCase().includes(lowerQuery)
        );
      })
      .map(([iata, airport]) => ({
        origin_iata: iata,
        origin_city: airport.city,
        origin_country: countriesData[airport.country] || airport.country,
        isCountry: false,
      }));

    setResults([...countryResults, ...airportResults]);
  }, [query]);

  // Click-outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSelect = (origin) => {
    onSelect(origin);
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const countryName = country || countriesData[iata];

  return (
    <div
      ref={cardRef}
      className={styles.card}
      onClick={() => { if (!open) setOpen(true); }}
      style={{ position: "relative" }}
    >
      <h1 className={styles.title}>{iata || "Select"}</h1>
      <p className={styles.subtitle}>
        {isCountry ? countryName || "Select" : city || "City"}
      </p>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            zIndex: 1000,
          }}
        >
          <SearchBox width="100%" height="40px" onChange={setQuery} />
          <SearchResults
            width="100%"
            height="300px"
            results={results}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}