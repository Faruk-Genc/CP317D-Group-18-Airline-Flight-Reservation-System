import airports from "../../../../../scripts/flightgenerator/data/airports.json";
import countries from "../../../../../scripts/flightgenerator/data/countries.json";

export default function SearchResults({
  width,
  height,
  query,
  onSelect,
}) {
  if (!query) return null;

  const q = query.trim().toLowerCase();

  const countryResults = Object.entries(countries)
    .filter(([code, name]) => {
      return (
        code.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q)
      );
    })
    .map(([code, name]) => ({
      type: "country",
      code,
      name,
    }))
    .slice(0, 10);

  const airportResults = Object.entries(airports)
    .filter(([iata]) => {
      return iata.toLowerCase().includes(q);
    })
    .map(([iata, data]) => ({
      type: "airport",
      iata,
      city: data.city,
      country: data.country,
    }))
    .slice(0, 10);

  const results = [...countryResults, ...airportResults];

  return (
    <div
      style={{
        width,
        backgroundColor: "#fff",
        overflowY: height ? "auto" : "visible",
        maxHeight: height || "none",
      }}
    >
      {results.map((item) => {
        if (item.type === "country") {
          return (
            <div
              key={`c-${item.code}`}
              onClick={() =>
                onSelect?.({
                  type: "country",
                  country: item.code,
                  label: item.name, 
                })
              }
              style={{
                padding: "8px",
                borderBottom: "1px solid #ccc",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              🌍 {item.name} ({item.code})
            </div>
          );
        }

        return (
          <div
            key={`a-${item.iata}`}
            onClick={() =>
              onSelect?.({
                type: "airport",
                iata: item.iata,
                city: item.city,
                country: item.country,
                label: item.iata, 
              })
            }
            style={{
              padding: "8px",
              borderBottom: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            <strong>{item.iata}</strong> — {item.city} ({item.country})
          </div>
        );
      })}
    </div>
  );
}