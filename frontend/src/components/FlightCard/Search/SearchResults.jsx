import airportsData from "../../../../../scripts/flightgenerator/data/airports.json";
import countriesData from "../../../../../scripts/flightgenerator/data/countries.json";

function computeResults(query) {
  const lowerQuery = query.toLowerCase();

  const matchedCountryEntries = Object.entries(countriesData).filter(
    ([code, countryName]) =>
      code.toLowerCase().includes(lowerQuery) ||
      countryName.toLowerCase().includes(lowerQuery)
  );

  const countryResults = matchedCountryEntries.map(([code, countryName]) => ({
    origin_iata: code,
    origin_city: "",
    origin_country: countryName,
    isCountry: true,
  }));

  const airportResults = Object.entries(airportsData)
    .filter(([iata, airport]) =>
      iata.toLowerCase().includes(lowerQuery) ||
      (airport.city && airport.city.toLowerCase().includes(lowerQuery))
    )
    .map(([iata, airport]) => ({
      origin_iata: iata,
      origin_city: airport.city,
      origin_country: countriesData[airport.country] || airport.country,
      isCountry: false,
    }));

  return [...countryResults, ...airportResults];
}

export default function SearchResults({ width, height, query, results, onSelect }) {
  const items = results ?? (query?.trim() ? computeResults(query.trim()) : []);

  if (!items.length) return null;

  return (
    <div
      style={{
        width,
        backgroundColor: "#fff",
        overflowY: height ? "auto" : "visible",
        maxHeight: height || "none",
        border: "1.5px solid #e2e8f0",
        borderRadius: "10px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        marginTop: "4px",
        overflow: "hidden",
      }}
    >
      {items.map((item, index) => (
        <div
          key={
            item.isCountry
              ? `country-${item.origin_iata}`
              : `${item.origin_iata}-${item.origin_city}-${item.origin_country}`
          }
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect?.(item);
          }}
          style={{
            padding: "10px 14px",
            borderBottom: index < items.length - 1 ? "1px solid #f1f5f9" : "none",
            cursor: "pointer",
            color: "#0f172a",
            fontSize: "14px",
            backgroundColor: "#fff",
            transition: "background 0.15s",
            display: "flex",
            flexDirection: "column",
            gap: "1px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eff6ff")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
        >
          {item.isCountry ? (
            <>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>
                {item.origin_country}
              </span>
              <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
                {item.origin_iata} · Country
              </span>
            </>
          ) : (
            <>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>
                {item.origin_city}{" "}
                <span style={{ color: "#3b82f6", fontFamily: "monospace" }}>
                  ({item.origin_iata})
                </span>
              </span>
              <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
                {item.origin_country}
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}