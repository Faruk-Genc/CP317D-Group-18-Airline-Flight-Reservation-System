import React from "react";
import styles from "./HeroMessage.module.css";
import heroImage from "../../assets/svg-art/world-map.svg";
import { useLang } from "../../context/LangContext";

export default function HeroMessage() {
  const { en } = useLang();

  return (
    <div className={styles.heroMessageWrapper}>
      <div className={styles.heroMessage}>
        <img className={styles.heroArt} src={heroImage} alt="heroImage" />

        <div className={styles.heroText}>

          <div className={`${styles.heroCall} ${en ? "" : styles.french}`}>
            {en ? (<>Plan your adventure today!</>) : (<>Planifiez votre aventure <br/>dès aujourd'hui !</>)}
          </div>

          <div className={styles.heroHeadingWrapper}>
            <div className={styles.heroHeading}>
              6,500
              <div className={styles.heroSubheading}>
                {en ? "daily flights" : "vols quotidiens"}
              </div>
            </div>
            <div className={styles.heroHeading}>
              130+
              <div className={styles.heroSubheading}>
                {en ? "destinations" : "destinations"}
              </div>
            </div>
            <div className={styles.heroHeading}>
              58
              <div className={styles.heroSubheading}>
                {en ? "countries" : "pays"}
              </div>
            </div>
          </div>

          <button className={styles.heroButton}>
            {en ? "View Flights" : "Voir les vols"}
          </button>
        </div>
      </div>
    </div>
  );
}