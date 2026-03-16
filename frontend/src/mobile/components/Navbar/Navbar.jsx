import logo from "../../../assets/logo/airline-logo.svg";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.nav} style={{ padding: 20 }}>
      <img className={styles.logo} src={logo} alt="Air Laurier Logo" />
      <div className={styles.buttonGroup}>
        <button className={styles.button}>FR</button>
        <button className={styles.button}>Sign In</button>
      </div>
    </nav>
  );
}