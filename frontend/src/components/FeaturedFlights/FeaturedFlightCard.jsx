import "./FeaturedFlightCard.css";

// Import all images from the featured folder
const images = import.meta.glob(
  "../../assets/featured/*.{jpg,jpeg,png,svg,webp}",
  { eager: true }
);

// Map filenames to lowercase, space-free keys
const imageMap = Object.keys(images).reduce((acc, path) => {
  const filename = path.split("/").pop(); // e.g., "newyork.jpg"
  const key = filename.split(".")[0].toLowerCase().replace(/\s+/g, "");
  acc[key] = images[path].default;
  return acc;
}, {});

export default function FeaturedFlightCard({ from, to }) {
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
        <h3>
          {from} → {to}
        </h3>
      </div>
    </div>
  );
}