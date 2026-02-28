import "./Navbar.css";
import logo from "../../assets/logo/airline-logo.svg";
import { useLang } from "../../context/LangContext";

export default function Navbar({ onSignIn, onHome, onFlightStatus, onCheckIn, onMyFlights }) {
  const { en, toggle } = useLang();

  return (
    <nav className="nav">
      <section className="nav-brand">
        <img className="nav-logo" src={logo} alt="placeholder" />
        <div className="nav-title">AIR LAURIER</div>
      </section>

      <section className={`nav-options ${en ? "" : "french"}`}>
        <ul className="nav-list">
          <li className="nav-item">
            <div className="nav-link" onClick={onHome}>
              {en ? "Book Flights" : "Statut des vols"}
            </div>
          </li>
          <li className="nav-item">
            <div className="nav-link" onClick={onFlightStatus}>
              {en ? "Flight Status" : "Statut des vols"}
            </div>
          </li>
          <li className="nav-item">
            <div className="nav-link" onClick={onCheckIn}>
              {en ? "Check In" : "Enregistrement"}
            </div>
          </li>
          <li className="nav-item">
            <div className="nav-link" onClick={onMyFlights}>
              {en ? "My Flights" : "Mes vols"}
            </div>
          </li>
        </ul>
      </section>

      <section id="user-authentication">
        <button className="select-language" onClick={toggle}>
          {en ? "FR" : "EN"}
        </button>

        <img className="user-icon" src="https://placehold.co/50x50" alt="placeholder" />

        <button className="sign-in-button" onClick={onSignIn}>
          {en ? "Sign in" : "Se connecter"}
        </button>
      </section>
    </nav>
  );
}