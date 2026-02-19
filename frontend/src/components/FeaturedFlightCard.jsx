import "./FeaturedFlightCard.css";

const images = import.meta.glob(
  "../assets/featured/*.{jpg,jpeg,png,svg}",
  { eager: true }
);

const imageArray = Object.values(images).map((m) => m.default);

export default function FeaturedFlightCard({ from, to }) {
  const randomImage =
    imageArray[Math.floor(Math.random() * imageArray.length)];

  return (
    <div className="featured-flight-card">
      <img src={randomImage} alt="flight" />

      <div className="overlay">
        <h3>
          {from} → {to}
        </h3>
      </div>
    </div>
  );
}