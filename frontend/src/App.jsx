import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Nav/Navbar";
import UserDropDown from "./components/Dropdown/Userdropdown";
import Footer from "./components/Nav/Footer";
import HeroSplash from "./components/HeroComponents/HeroSplash";
import FeaturedFlights from "./components/FeaturedFlights/FeaturedFlights";
import HeroMessage from "./components/HeroComponents/HeroMessage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import FlightStatus from "./pages/FlightStatus";
import CheckIn from "./pages/CheckIn";
import MyFlights from "./pages/MyFlights";
import AdminPanel from "./pages/AdminPanel";
import Results from "./pages/Results";
import TripReview from "./pages/TripReview";
import Confirmation from "./pages/Confirmation";

import "./App.css";

const heroImages = import.meta.glob("./assets/heropage/*.{jpg,jpeg,png,svg}", { eager: true });
const imagesArray = Object.values(heroImages).map((module) => module.default);

function App() {
  const validPages = [
    "home", "sign-in", "sign-up", "results", "trip-review",
    "confirmation", "flight-status", "check-in", "my-flights", "admin-panel"
  ];

  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname.replace("/", "");
    return validPages.includes(path) ? path : localStorage.getItem("page") || "home";
  });

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const hideDropdownTimeout = useRef(null);
  const [forceHideLoader, setForceHideLoader] = useState(false);
  const isInitialMount = useRef(true);
  const [heroImage] = useState(() =>
    imagesArray[Math.floor(Math.random() * imagesArray.length)]
  );

  const [booking, setBooking] = useState({
    search: {
      from: { iata: "YYZ", city: "Toronto", isCountry: false, origin_country: "" },
      to: { iata: "HND", city: "Tokyo", isCountry: false, origin_country: "" },
      departDate: null,
      returnDate: null,
    },
    tripOptions: { passengers: 1, tripType: "one-way", cabinClass: "economy" },
    selectedFlight: { outbound: { flight: null, times: null }, inbound: { flight: null, times: null } },
    priceSummary: { baseFare: 0, taxesAndFees: 0, total: 0, currency: "CAD" },
    confirmation: { reference: null, confirmedAt: null },
  });

  const handleUserEnter = () => {
    if (hideDropdownTimeout.current) clearTimeout(hideDropdownTimeout.current);
    setShowUserDropdown(true);
  };
  const handleUserLeave = () => {
    hideDropdownTimeout.current = setTimeout(() => setShowUserDropdown(false), 250);
  };

  const navigateToPage = (page) => {
    if (page === currentPage) return;
    setForceHideLoader(currentPage === "results" && page !== "results");
    setCurrentPage(page);
  };

  useEffect(() => {
    localStorage.setItem("page", currentPage);
    if (isInitialMount.current) {
      window.history.replaceState(null, "", currentPage === "home" ? "/" : `/${currentPage}`);
      isInitialMount.current = false;
    } else {
      window.history.pushState(null, "", currentPage === "home" ? "/" : `/${currentPage}`);
    }
  }, [currentPage]);

  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname.replace("/", "");
      setCurrentPage(validPages.includes(path) ? path : "home");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const selectFlightAndReview = (flight) => {
    const getTimes = (f) => ({
      departure: new Date(f.departure_time).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      arrival: new Date(f.arrival_time).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    });

    const isRoundTrip = booking.tripOptions.tripType === "round-trip";
    const passengers = booking.tripOptions.passengers ?? 1;

    if (isRoundTrip && !booking.selectedFlight.outbound.flight) {
      setBooking(prev => ({
        ...prev,
        selectedFlight: { ...prev.selectedFlight, outbound: { flight, times: getTimes(flight) } }
      }));
      return;
    }

    let baseFare, taxesAndFees, total;
    if (isRoundTrip) {
      const outFare = booking.selectedFlight.outbound.flight?.base_cost_cad ?? 0;
      const inFare = flight?.base_cost_cad ?? 0;
      baseFare = (outFare + inFare) * passengers;
      taxesAndFees = baseFare * 0.13;
      total = baseFare + taxesAndFees;
    } else {
      baseFare = (flight.base_cost_cad ?? 0) * passengers;
      taxesAndFees = baseFare * 0.13;
      total = baseFare + taxesAndFees;
    }

    setBooking(prev => ({
      ...prev,
      selectedFlight: {
        outbound: isRoundTrip ? prev.selectedFlight.outbound : { flight, times: getTimes(flight) },
        inbound: isRoundTrip ? { flight, times: getTimes(flight) } : { flight: null, times: null },
      },
      priceSummary: { baseFare, taxesAndFees, total, currency: "CAD" }
    }));

    navigateToPage("trip-review");
  };

  const generateReference = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };
  const confirmPurchase = () => {
    const reference = generateReference();
    setBooking(prev => ({ ...prev, confirmation: { reference, confirmedAt: new Date().toISOString() } }));
    navigateToPage("confirmation");
  };

  return (
    <>
      <Navbar
        page={currentPage}
        onSignIn={() => navigateToPage("sign-in")}
        onSignUp={() => navigateToPage("sign-up")}
        onHome={() => navigateToPage("home")}
        onFlightStatus={() => navigateToPage("flight-status")}
        onCheckIn={() => navigateToPage("check-in")}
        onAdminPanel={() => navigateToPage("admin-panel")}
        onMyFlights={() => navigateToPage("my-flights")}
        onUserEnter={handleUserEnter}
        onUserLeave={handleUserLeave}
      />
      <UserDropDown
        visible={showUserDropdown}
        onEnter={handleUserEnter}
        onLeave={handleUserLeave}
      />
      <div className="page-container">
        {currentPage === "home" && (
          <div className="page home">
            <HeroSplash
              heroImage={heroImage}
              search={booking.search}
              tripOptions={booking.tripOptions}
              onSearch={(payload) => { setBooking(prev => ({ ...prev, ...payload })); navigateToPage("results"); }}
              setSearch={(data) => setBooking(prev => ({ ...prev, search: { ...prev.search, ...data } }))}
              setTripOptions={(data) => setBooking(prev => ({ ...prev, tripOptions: { ...prev.tripOptions, ...data } }))}
            />
            <FeaturedFlights />
            <HeroMessage />
          </div>
        )}

        {currentPage === "sign-in" && (
          <SignIn
            onSignUp={() => navigateToPage("sign-up")}
            onBack={() => navigateToPage("home")}
            onSignInSuccess={() => navigateToPage("home")}
          />
        )}

        {currentPage === "sign-up" && (
          <SignUp
            onBack={() => navigateToPage("home")}
            onSignUpSuccess={() => navigateToPage("home")}
          />
        )}

        {currentPage === "results" && (
          <Results
            booking={booking}
            onSelectFlight={selectFlightAndReview}
            onBack={() => navigateToPage("home")}
            forceHideLoader={forceHideLoader}
          />
        )}

        {currentPage === "trip-review" && (
          <TripReview
            booking={booking}
            onConfirm={confirmPurchase}
            onBack={() => navigateToPage("results")}
            onSignIn={() => navigateToPage("sign-in")}
          />
        )}

        {currentPage === "confirmation" && (
          <Confirmation
            booking={booking}
            onBackHome={() => navigateToPage("home")}
          />
        )}

        {currentPage === "flight-status" && (
          <FlightStatus onBack={() => navigateToPage("home")} />
        )}

        {currentPage === "check-in" && (
          <CheckIn onBack={() => navigateToPage("home")} />
        )}

        {currentPage === "admin-panel" && (
          <AdminPanel onBack={() => navigateToPage("home")} />
        )}

        {currentPage === "my-flights" && (
          <MyFlights onBack={() => navigateToPage("home")} />
        )}
      </div>
      <Footer />
    </>
  );
}

export default App;