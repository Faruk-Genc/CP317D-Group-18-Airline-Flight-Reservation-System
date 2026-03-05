import React from "react";
import styles from "./HeroMessage.module.css";
import heroImage from "../../assets/svg-art/world-map.svg";
import { useLang } from "../../context/LangContext";

export default function HeroMessage() {
  const { en } = useLang();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <img className={styles.art} src={heroImage} alt="heroImage" />

        <div className={styles.text}>

          <div className={`${styles.call} ${en ? "" : styles.french}`}>
            {en ? (<>Plan your adventure today!</>) : (<>Planifiez votre aventure <br/>dès aujourd'hui !</>)}
          </div>

          <div className={styles.stats}>
            <div className={styles.heading}>
              6,500
              <div className={styles.sub}>
                {en ? "daily flights" : "vols quotidiens"}
              </div>
            </div>
            <div className={styles.heading}>
              130+
              <div className={styles.sub}>
                {en ? "destinations" : "destinations"}
              </div>
            </div>
            <div className={styles.heading}>
              58
              <div className={styles.sub}>
                {en ? "countries" : "pays"}
              </div>
            </div>
          </div>

          <button className={styles.button}>
            {en ? "View Flights" : "Voir les vols"}
          </button>
        </div>
      </div>
    </div>
  );
}