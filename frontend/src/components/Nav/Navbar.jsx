import styles from "./Navbar.module.css";
import logo from "../../assets/logo/airline-logo.svg";
import { useLang } from "../../context/LangContext";

export default function Navbar({ onSignIn, onHome, onFlightStatus, onCheckIn, onMyFlights }) {
  const { en, toggle } = useLang();

  return (
    <nav className={styles.nav}>
      <section className={styles.navBrand}>
        <img className={styles.navLogo} src={logo} alt="placeholder" onClick={onHome}/>
        <div className={styles.navTitle} onClick={onHome}>AIR LAURIER</div>
      </section>

      <section className={`${styles.navOptions} ${en ? "" : styles.french}`}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <div className={styles.navLink} onClick={onHome}>
              {en ? "Book Flights" : "Réserver un vol"}
            </div>
          </li>
          <li className={styles.navItem}>
            <div className={styles.navLink} onClick={onFlightStatus}>
              {en ? "Flight Status" : "Statut des vols"}
            </div>
          </li>
          <li className={styles.navItem}>
            <div className={styles.navLink} onClick={onCheckIn}>
              {en ? "Check In" : "Enregistrement"}
            </div>
          </li>
          <li className={styles.navItem}>
            <div className={styles.navLink} onClick={onMyFlights}>
              {en ? "My Flights" : "Mes vols"}
            </div>
          </li>
        </ul>
      </section>

      <section className={styles.userAuthentication}>
        <button className={styles.selectLanguage} onClick={toggle}>
          {en ? "FR" : "EN"}
        </button>

        <img className={styles.userIcon} src="https://placehold.co/50x50" alt="placeholder" />

        <button className={styles.signInButton} onClick={onSignIn}>
          {en ? "Sign in" : "Se connecter"}
        </button>
      </section>
    </nav>
  );
}