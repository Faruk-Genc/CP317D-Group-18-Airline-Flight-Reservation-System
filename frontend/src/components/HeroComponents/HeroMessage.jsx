import React from "react";
import "./HeroMessage.css";
import heroImage from "../../assets/svg-art/world-map.svg";
import { useLang } from "../../context/LangContext";

export default function HeroMessage() {
  const { en } = useLang();

  return (
    <div className="hero-message-wrapper">
      <div className="hero-message">
        <img className="hero-art" src={heroImage} alt="heroImage" />

        <div className="hero-text">

          <div className={`hero-call ${en ? "" : "french"}`}>
            {en ? (<>Plan your adventure today!</>) : (<>Planifiez votre aventure <br/>dès aujourd'hui !</>)}
          </div>

          <div className="hero-heading-wrapper">
            <div className="hero-heading">
              5,000
              <div className="hero-subheading">
                {en ? "daily flights" : "vols quotidiens"}
              </div>
            </div>
            <div className="hero-heading">
              790+
              <div className="hero-subheading">
                {en ? "destinations" : "destinations"}
              </div>
            </div>
            <div className="hero-heading">
              58
              <div className="hero-subheading">
                {en ? "countries" : "pays"}
              </div>
            </div>
          </div>

          <button className="hero-button">
            {en ? "View Flights" : "Voir les vols"}
          </button>
        </div>
      </div>
    </div>
  );
}