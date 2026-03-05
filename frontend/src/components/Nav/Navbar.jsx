import styles from "./Navbar.module.css";
import logo from "../../assets/logo/airline-logo.svg";
import { useLang } from "../../context/LangContext";

export default function Navbar({ onSignIn, onHome, onFlightStatus, onCheckIn, onMyFlights }) {
  const { en, toggle } = useLang();

  return (
    <nav className={styles.bar}>
      <section className={styles.brand}>
        <img className={styles.logo} src={logo} alt="placeholder" onClick={onHome}/>
        <div className={styles.title} onClick={onHome}>AIR LAURIER</div>
      </section>

      <section className={`${styles.options} ${en ? "" : styles.french}`}>
        <ul className={styles.list}>
          <li className={styles.item}>
            <div className={styles.link} onClick={onHome}>
              {en ? "Book Flights" : "Réserver un vol"}
            </div>
          </li>
          <li className={styles.item}>
            <div className={styles.link} onClick={onFlightStatus}>
              {en ? "Flight Status" : "Statut des vols"}
            </div>
          </li>
          <li className={styles.item}>
            <div className={styles.link} onClick={onCheckIn}>
              {en ? "Check In" : "Enregistrement"}
            </div>
          </li>
          <li className={styles.item}>
            <div className={styles.link} onClick={onMyFlights}>
              {en ? "My Flights" : "Mes vols"}
            </div>
          </li>
        </ul>
      </section>

      <section className={styles.auth}>
        <button className={styles.language} onClick={toggle}>
          {en ? "FR" : "EN"}
        </button>

        <img className={styles.userIcon} src="https://placehold.co/50x50" alt="placeholder" />

        <button className={styles.signIn} onClick={onSignIn}>
          {en ? "Sign in" : "Se connecter"}
        </button>
      </section>
    </nav>
  );
}