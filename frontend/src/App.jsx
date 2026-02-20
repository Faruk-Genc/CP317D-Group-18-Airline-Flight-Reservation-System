// App.js
import { useState } from 'react';
import FlightCard from './components/FlightCard/FlightCard';
import Navbar from './components/Navbar';
import Heropage from './components/Heropage';
import TripOptions from "./components/FlightCard/TripOptions";
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <Heropage />
    </>
  );
}


export default App;
