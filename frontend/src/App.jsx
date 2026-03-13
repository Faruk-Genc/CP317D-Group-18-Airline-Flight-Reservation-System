import { useState, useEffect, useRef } from "react";
import { LangProvider } from "./context/LangContext";
import Navbar from "./components/Nav/Navbar";
import UserDropDown from "./components/UserDropdown/Userdropdown";
import Footer from "./components/Nav/Footer";
import HeroSplash from "./components/HeroComponents/HeroSplash";
import FeaturedFlights from "./components/FeaturedFlights/FeaturedFlights";
import HeroMessage from "./components/HeroComponents/HeroMessage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
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
  const validPages = [
    "home",
    "sign-in",
    "sign-up",
    "results",
    "trip-review",
    "confirmation",
    "flight-status",
    "check-in",
    "my-flights",
  ];

 const [showUserDropdown, setShowUserDropdown] = useState(false);
const hideDropdownTimeout = useRef(null);

const handleUserEnter = () => {
  if (hideDropdownTimeout.current) {
    clearTimeout(hideDropdownTimeout.current);
    hideDropdownTimeout.current = null;
  }
  setShowUserDropdown(true);
};

const handleUserLeave = () => {
  hideDropdownTimeout.current = setTimeout(() => {
    setShowUserDropdown(false);
  }, 250); 
};

  const [page, setPage] = useState(() => {
    const path = window.location.pathname.replace("/", "");
    if (path && validPages.includes(path)) return path;
    return localStorage.getItem("page") || "home";
  });

  const [heroImage] = useState(() => imagesArray[Math.floor(Math.random() * imagesArray.length)]);
  const isInitialMount = useRef(true);

  const [booking, setBooking] = useState({
    search: {
      from: { iata: "YYZ", city: "Toronto", isCountry: false, origin_country: "" },
      to: { iata: "HND", city: "Tokyo", isCountry: false, origin_country: "" },
      departDate: null,
      returnDate: null,
    },
    tripOptions: {
      passengers: 1,
      tripType: "one-way",
      cabinClass: "economy",
    },
    selectedFlight: {
      outbound: { flight: null, times: null },
      inbound: { flight: null, times: null }
    },
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

  useEffect(() => {
    localStorage.setItem("page", page);

    if (isInitialMount.current) {
      if (page === "home") window.history.replaceState(null, "", "/");
      else window.history.replaceState(null, "", `/${page}`);
      isInitialMount.current = false;
    } else {
      if (page === "home") window.history.pushState(null, "", "/");
      else window.history.pushState(null, "", `/${page}`);
    }
  }, [page]);

  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname.replace("/", "");
      if (validPages.includes(path)) setPage(path);
      else setPage("home");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const goResults = (payload) => {
    setBooking((prev) => ({ ...prev, ...payload }));
    setPage("results");
  };

  useEffect(() => {
    if (page === "home") {
      setBooking(prev => ({
        ...prev,
        selectedFlight: {
          outbound: { flight: null, times: null },
          inbound: { flight: null, times: null }
        },
        priceSummary: {
          baseFare: 0,
          taxesAndFees: 0,
          total: 0,
          currency: "CAD"
        },
        confirmation: {
          reference: null,
          confirmedAt: null
        }
      }));
    }
  }, [page]);

  const selectFlightAndReview = (flight) => {
    const getFlightTimes = (flightData) => ({
      departure: new Date(flightData.departure_time).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      arrival: new Date(flightData.arrival_time).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    });

    if (
      booking.tripOptions.tripType === "round-trip" &&
      booking.selectedFlight.outbound.flight === null
    ) {
      setBooking((prev) => ({
        ...prev,
        selectedFlight: {
          ...prev.selectedFlight,
          outbound: {
            flight: flight,
            times: getFlightTimes(flight)
          }
        }
      }));
      setPage("results");
      return;
    }

    const isRoundTrip = booking.tripOptions.tripType === "round-trip";
    const passengers = booking.tripOptions.passengers ?? 1;
    let baseFare, taxesAndFees, total;
    if (isRoundTrip) {
      const outFare = booking.selectedFlight.outbound.flight?.base_cost_cad ?? 0;
      const inFare = flight?.base_cost_cad ?? 0;
      baseFare = (outFare + inFare) * passengers;
      taxesAndFees = 0.13 * baseFare;
      total = baseFare + taxesAndFees;
    } else {
      baseFare = (flight.base_cost_cad ?? 0) * passengers;
      taxesAndFees = baseFare * 0.13;
      total = baseFare + taxesAndFees;
    }

    setBooking(prev => ({
      ...prev,
      selectedFlight: {
        outbound: isRoundTrip ? prev.selectedFlight.outbound : { flight: flight, times: getFlightTimes(flight) },
        inbound: isRoundTrip ? { flight: flight, times: getFlightTimes(flight) } : { flight: null, times: null }
      },
      priceSummary: {
        baseFare,
        taxesAndFees,
        total,
        currency: 'CAD',
      }
    }));
    setPage("trip-review");
  };

  useEffect(() => {
    console.log("Booking updated:", booking);
  }, [booking]);

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
        page={page}
        onSignIn={() => setPage("sign-in")}
        onSignUp={() => setPage("sign-up")}
        onHome={() => setPage("home")}
        onFlightStatus={() => setPage("flight-status")}
        onCheckIn={() => setPage("check-in")}
        onMyFlights={() => setPage("my-flights")}
        onUserEnter={handleUserEnter}
        onUserLeave={handleUserLeave}
      />

      <UserDropDown
        visible={showUserDropdown}
        onEnter={handleUserEnter}
        onLeave={handleUserLeave}
      />

      <div className="scrollable-content">
        <div style={{ display: page === "home" ? "block" : "none" }}>
          <HeroSplash
            heroImage={heroImage}
            onSearch={goResults}
            search={booking.search}
            tripOptions={booking.tripOptions}
            setSearch={(data) =>
              setBooking((prev) => ({ ...prev, search: { ...prev.search, ...data } }))
            }
            setTripOptions={(data) =>
              setBooking((prev) => ({ ...prev, tripOptions: { ...prev.tripOptions, ...data } }))
            }
          />
        </div>

        <div style={{ display: page === "sign-in" ? "block" : "none" }}>
          <SignIn
            onSignUp={() => setPage("sign-up")}
            onBack={() => setPage("home")}
            onSignInSuccess={() => setPage("home")}
          />
        </div>

        <div style={{ display: page === "sign-up" ? "block" : "none" }}>
          <SignUp
            onBack={() => setPage("home")}
            onSignUpSuccess={() => setPage("home")}
          />
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

      {page === "home" && (
        <>
          <FeaturedFlights />
          <HeroMessage />
        </>
      )}

      <Footer />
    </LangProvider>
  );
}

export default App;