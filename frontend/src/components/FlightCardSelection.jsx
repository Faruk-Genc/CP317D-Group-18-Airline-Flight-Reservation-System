import "./FlightCardSelection.css";

export default function FlightCardSelection() {
  const resultsCount = 2;

  return (
    <div className="selection-card">
      <input
        className="search-input"
        type="text"
        placeholder="Search.."
      />

      <section className="results">
        {Array.from({ length: resultsCount }).map((_, i) => (
          <div className="query-result" key={i}>
            test
          </div>
        ))}
      </section>
    </div>
  );
}