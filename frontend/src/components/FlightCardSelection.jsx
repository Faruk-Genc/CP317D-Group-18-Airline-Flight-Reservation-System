import { useState, useEffect, useRef } from "react";
import "./FlightCardSelection.css";

export default function FlightCardSelection({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showNoResults, setShowNoResults] = useState(false);
  const [active, setActive] = useState(false); // controls dropdown visibility
  const inputRef = useRef(null);

  // Fetch results with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowNoResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetch(`http://localhost:5000/api/flights?origin=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          // Deduplicate by IATA + city + country
          const seen = new Set();
          const unique = data.filter((origin) => {
            const key = `${origin.origin_iata}-${origin.origin_city}-${origin.origin_country}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          setResults(unique);
          setShowNoResults(unique.length === 0);
        })
        .catch((err) => {
          console.error("Search error:", err);
          setResults([]);
          setShowNoResults(true);
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Clicking outside closes dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".selection-card")) {
        setActive(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Clicking card focuses input and opens dropdown
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
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />

      {active && results.length > 0 && (
        <section className="results">
          {results.map((origin) => (
            <div
              className="query-result"
              key={`${origin.origin_iata}-${origin.origin_city}-${origin.origin_country}`}
              onClick={() => {
                onSelect(origin);
                setQuery(""); // optional: clear query after selection
                setActive(false); // close dropdown
              }}
            >
              <strong>{origin.origin_city}</strong> ({origin.origin_iata}) – {origin.origin_country}
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