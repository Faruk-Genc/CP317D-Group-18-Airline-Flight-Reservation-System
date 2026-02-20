import "./Heropage.css";
import FlightCard from './FlightCard/FlightCard';
import TripOptions from './FlightCard/TripOptions';
import FeaturedFlights from "./FeaturedFlights/FeaturedFlights";



const heroImages = import.meta.glob('../assets/heropage/*.{jpg,jpeg,png,svg}', { eager: true });

export default function Heropage() {
  const imagesArray = Object.values(heroImages).map(module => module.default);

  const randomImage = imagesArray[Math.floor(Math.random() * imagesArray.length)];

  return (
   <section className="hero-wrapper">
        <section className="hero-splash-wrapper">
            <div style={{ marginTop: "200px" }}> 
                <FlightCard
                    iata1="YYZ"
                    city1="Toronto"
                    iata2="HND"
                    city2="Tokyo"
                />

                <TripOptions />
            </div>
            <img className="hero-splash radial" src={randomImage} alt="Hero" />
            <img className="hero-splash" src={randomImage} alt="Hero" />
        </section>
        <FeaturedFlights />

    </section>


  );
}
