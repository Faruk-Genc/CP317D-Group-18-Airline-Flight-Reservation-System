import { useState } from "react";
import { LangContext } from './context/LangContext';
import Navbar from './components/Nav/Navbar';
import Footer from './components/Nav/Footer';
import Heropage from './components/HeroComponents/Heropage';
import SignIn from './pages/SignIn';
import FlightStatus from "./pages/FlightStatus";
import CheckIn from "./pages/CheckIn";
import MyFlights from "./pages/MyFlights";

import './App.css';

const heroImages = import.meta.glob('./assets/heropage/*.{jpg,jpeg,png,svg}', { eager: true });
const imagesArray = Object.values(heroImages).map(module => module.default);

function App() {
  const [en, setEn] = useState(true);
  const toggle = () => setEn(e => !e);

  const [page, setPage] = useState("home"); // "home", "sign-in", "flight-status", "check-in", "my-flights"
  const [heroImage] = useState(() => imagesArray[Math.floor(Math.random() * imagesArray.length)]);

  return (
    <LangContext.Provider value={{ en, toggle }}>
      <Navbar
        onSignIn={() => setPage("sign-in")}
        onHome={() => setPage("home")}
        onFlightStatus={() => setPage("flight-status")}
        onCheckIn={() => setPage("check-in")}
        onMyFlights={() => setPage("my-flights")}
      />

      <div className="scrollable-content">
        {page === "home" && <Heropage heroImage={heroImage} />}
        {page === "sign-in" && <SignIn onBack={() => setPage("home")} />}
        {page === "flight-status" && <FlightStatus onBack={() => setPage("home")} />}
        {page === "check-in" && <CheckIn onBack={() => setPage("home")} />}
        {page === "my-flights" && <MyFlights onBack={() => setPage("home")} />}
      </div>

      <Footer />
    </LangContext.Provider>
  );
}

export default App;