import { useState, useEffect, useRef } from "react";
import airportsData from "../../../../scripts/flightgenerator/data/airports.json";
import countriesData from "../../../../scripts/flightgenerator/data/countries.json";
import "./FlightCardSelection.css";

export default function FlightCardSelection({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showNoResults, setShowNoResults] = useState(false);
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowNoResults(false);
      return;
    }

    const lowerQuery = query.toLowerCase();

    const matchedCountryEntries = Object.entries(countriesData).filter(
      ([code, countryName]) => countryName.toLowerCase().includes(lowerQuery)
    );

    const countryResults = matchedCountryEntries.map(([code, countryName]) => ({
      origin_iata: null,
      origin_city: "",
      origin_country: countryName,
      isCountry: true,
    }));

    const filteredAirports = Object.entries(airportsData)
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

    const allResults = [...countryResults, ...filteredAirports];
    setResults(allResults);
    setShowNoResults(allResults.length === 0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".selection-card")) setActive(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleCardClick = () => {
    setActive(true);
    inputRef.current?.focus();
  };

  return (
    <div className="selection-card" onClick={handleCardClick}>
      <input
        ref={inputRef}
        className="search-input"
        type="text"
        placeholder="Search airport, city, or country"
        value={selected?.isCountry ? selected.origin_country : query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(null);
        }}
        autoComplete="off"
      />

      {active && results.length > 0 && (
        <section className="results">
          {results.map((origin) => (
            <div
              className="query-result"
              key={
                origin.isCountry
                  ? `country-${origin.origin_country}`
                  : `${origin.origin_iata}-${origin.origin_city}-${origin.origin_country}`
              }
              onClick={() => {
                setSelected(origin);
                onSelect(origin);
                setQuery("");
                setActive(false);
              }}
            >
              {origin.isCountry
                ? origin.origin_country
                : `${origin.origin_city} (${origin.origin_iata}) – ${origin.origin_country}`}
            </div>
          ))}
        </section>
      )}

      {active && query && showNoResults && (
        <div className="no-results">No results found</div>
      )}
    </div>
  );
}