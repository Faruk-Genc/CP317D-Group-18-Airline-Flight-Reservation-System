// App.js
import { useState } from 'react';
import FlightCard from './components/FlightCard/FlightCard';
import Navbar from './components/Nav/Navbar';
import Heropage from './components/HeroComponents/Heropage';
import TripOptions from "./components/FlightCard/TripOptions";
import Footer from './components/Nav/Footer';
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <Heropage />
      <Footer />
    </>
  );
}


export default App;
