import styles from "./Navbar.module.css";
import logo from "../../assets/logo/airline-logo.svg";
import iconImg from "../../assets/icons/usericon.png"
import { useLang } from "../../context/LangContext";
import { useUser } from "../../context/UserContext"; 

export default function Navbar({ page, onSignIn, onHome, onFlightStatus, onCheckIn, onMyFlights }) {
  const { en, toggle } = useLang();
  const { user } = useUser();

  return (
    <nav className={styles.bar}>
      <section className={styles.brand}>
        <img className={styles.logo} src={logo} alt="logo" onClick={onHome} />
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

        {user && (
          <>
            <div className={styles.userName}>{user.forename}</div>
            <img className={styles.userIcon} src={iconImg} alt="user icon" />
          </>
        )}

        {!user && page !== "sign-in" && (
          <button className={styles.signIn} onClick={onSignIn}>
            {en ? "Sign in" : "Se connecter"}
          </button>
        )}
      </section>
    </nav>
  );
}