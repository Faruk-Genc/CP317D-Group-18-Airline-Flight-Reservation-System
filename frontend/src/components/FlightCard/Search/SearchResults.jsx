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
    .filter(([iata]) => iata.toLowerCase().includes(lowerQuery))
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
      }}
    >
      {items.map((item) => (
        <div
          key={
            item.isCountry
              ? `country-${item.origin_iata}`
              : `${item.origin_iata}-${item.origin_city}-${item.origin_country}`
          }
          onClick={() => onSelect?.(item)}
          style={{
            padding: "8px",
            borderBottom: "1px solid #ccc",
            cursor: "pointer",
            fontWeight: item.isCountry ? "600" : "inherit",
          }}
        >
          {item.isCountry
            ? `${item.origin_country} (${item.origin_iata})`
            : `${item.origin_city} (${item.origin_iata}) – ${item.origin_country}`}
        </div>
      ))}
    </div>
  );
}