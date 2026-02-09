import { useState, useEffect } from "react";
import "./FlightCardSelection.css";

export default function FlightCardSelection({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showNoResults, setShowNoResults] = useState(false);

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
    }, 300); // debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="selection-card">
      <input
        className="search-input"
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />

      {results.length > 0 && (
        <section className="results">
          {results.map((origin) => (
            <div
              className="query-result"
              key={`${origin.origin_iata}-${origin.origin_city}-${origin.origin_country}`}
              onClick={() => onSelect(origin)}
            >
              <strong>{origin.origin_city}</strong> ({origin.origin_iata}) – {origin.origin_country}
            </div>
          ))}
        </section>
      )}

      {query && showNoResults && (
        <div className="no-results">No results found</div>
      )}
    </div>
  );
}