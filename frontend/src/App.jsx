import { useState } from "react";
import { LangProvider } from "./context/LangContext";
import Navbar from "./components/Nav/Navbar";
import Footer from "./components/Nav/Footer";
import Heropage from "./components/HeroComponents/Heropage";
import SignIn from "./pages/SignIn";
import FlightStatus from "./pages/FlightStatus";
import CheckIn from "./pages/CheckIn";
import MyFlights from "./pages/MyFlights";
import Results from "./pages/Results";
import TripReview from "./pages/TripReview";
import Confirmation from "./pages/Confirmation";

import "./App.css";

const heroImages = import.meta.glob("./assets/heropage/*.{jpg,jpeg,png,svg}", { eager: true });
const imagesArray = Object.values(heroImages).map((module) => module.default);

function App() {
  const [page, setPage] = useState("home");
  const [heroImage] = useState(() => imagesArray[Math.floor(Math.random() * imagesArray.length)]);

  const [booking, setBooking] = useState({
    search: {
      from: { iata: "YYZ", city: "Toronto", isCountry: false, origin_country: "" },
      to: { iata: "HND", city: "Tokyo", isCountry: false, origin_country: "" },
      departDate: null,
      returnDate: null,
    },
    tripOptions: {
      passengers: 1,
      tripType: "round-trip",
      cabinClass: "economy",
    },
    selectedFlight: null,
    priceSummary: {
      baseFare: 0,
      taxesAndFees: 0,
      total: 0,
      currency: "CAD",
    },
    confirmation: {
      reference: null,
      confirmedAt: null,
    },
  });

  const goResults = (payload) => {
    setBooking((prev) => ({ ...prev, ...payload }));
    setPage("results");
  };

  const selectFlightAndReview = (flight) => {
    setBooking((prev) => ({
      ...prev,
      selectedFlight: flight,
      priceSummary: {
        baseFare: flight?.price ?? 0,
        taxesAndFees: 50,
        total: (flight?.price ?? 0) + 50,
        currency: "CAD",
      },
    }));
    setPage("trip-review");
  };

  const generateReference = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  };

  const confirmPurchase = () => {
    const reference = generateReference();
    setBooking((prev) => ({
      ...prev,
      confirmation: {
        reference,
        confirmedAt: new Date().toISOString(),
      },
    }));
    setPage("confirmation");
  };

  return (
    <LangProvider>
      <Navbar
        onSignIn={() => setPage("sign-in")}
        onHome={() => setPage("home")}
        onFlightStatus={() => setPage("flight-status")}
        onCheckIn={() => setPage("check-in")}
        onMyFlights={() => setPage("my-flights")}
      />

      <div className="scrollable-content">
        <div style={{ display: page === "home" ? "block" : "none" }}>
          <Heropage
            heroImage={heroImage}
            onSearch={goResults}
            search={booking.search}
            tripOptions={booking.tripOptions}
            setSearch={(data) =>
              setBooking((prev) => ({
                ...prev,
                search: { ...prev.search, ...data },
              }))
            }
            setTripOptions={(data) =>
              setBooking((prev) => ({
                ...prev,
                tripOptions: { ...prev.tripOptions, ...data },
              }))
            }
          />
        </div>

        <div style={{ display: page === "sign-in" ? "block" : "none" }}>
          <SignIn onBack={() => setPage("home")} />
        </div>

        <div style={{ display: page === "results" ? "block" : "none" }}>
          <Results booking={booking} onSelectFlight={selectFlightAndReview} onBack={() => setPage("home")} />
        </div>

        <div style={{ display: page === "trip-review" ? "block" : "none" }}>
          <TripReview booking={booking} onConfirm={confirmPurchase} onBack={() => setPage("results")} />
        </div>

        <div style={{ display: page === "confirmation" ? "block" : "none" }}>
          <Confirmation booking={booking} onBackHome={() => setPage("home")} />
        </div>

        <div style={{ display: page === "flight-status" ? "block" : "none" }}>
          <FlightStatus onBack={() => setPage("home")} />
        </div>

        <div style={{ display: page === "check-in" ? "block" : "none" }}>
          <CheckIn onBack={() => setPage("home")} />
        </div>

        <div style={{ display: page === "my-flights" ? "block" : "none" }}>
          <MyFlights onBack={() => setPage("home")} />
        </div>
      </div>

      <Footer />
    </LangProvider>
  );
}

export default App;