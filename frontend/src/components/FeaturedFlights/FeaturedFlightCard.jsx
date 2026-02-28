import "./FeaturedFlightCard.css";

const images = import.meta.glob(
  "../../assets/featured/*.{jpg,jpeg,png,svg,webp}",
  { eager: true }
);

const imageMap = Object.keys(images).reduce((acc, path) => {
  const filename = path.split("/").pop(); 
  const key = filename.split(".")[0].toLowerCase().replace(/\s+/g, "");
  acc[key] = images[path].default;
  return acc;
}, {});

export default function FeaturedFlightCard({ from, to, displayFrom, displayTo }) {
  const fromKey = from.toLowerCase().replace(/\s+/g, "");
  const toKey = to.toLowerCase().replace(/\s+/g, "");

  const fromImage = imageMap[fromKey];
  const toImage = imageMap[toKey];

  return (
    <div className="featured-flight-card">
      <div
        className="image-diagonal"
        style={{
          "--from-image": `url("${fromImage}")`,
          "--to-image": `url("${toImage}")`,
        }}
      />
      <div className="overlay">
        <h3 style={{ fontWeight: "400" }}>
          {displayFrom ?? from} → {displayTo ?? to}
        </h3>
      </div>
    </div>
  );
}