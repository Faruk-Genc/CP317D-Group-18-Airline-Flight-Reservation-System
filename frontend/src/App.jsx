import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import FlighCard from './components/FlightCard'
import FlighCardSelection from './components/FlightCardSelection'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
      <FlighCard
        aita1="TKO"
        city1="Tokyo"
        aita2="NYC"
        city2="New York City"
      />
      <br/>
      <FlighCard
        aita1="TOR"
        city1="Toronto"
        aita2="LON"
        city2="London"
      />
      <br/><br/><br/>
      {/* <FlighCardSelection></FlighCardSelection> */}
    </>
  )
}

export default App
