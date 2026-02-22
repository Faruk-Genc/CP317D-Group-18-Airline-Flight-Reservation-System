import React from "react";
import "./HeroMessage.css";
import heroImage from "../../assets/svg-art/world-map.svg"

export default function HeroMessage() {
  return (
    <div className="hero-message">
      <img className="hero-art" src={heroImage} alt="heroImage" />

      <div className="hero-text">
        <div className="hero-call">Plan your adventure today!</div>

        <div className="hero-heading-wrapper">
          <div className="hero-heading">
            1,100
            <div className="hero-subheading">daily flights</div>
          </div>
          <div className="hero-heading">
            790+
            <div className="hero-subheading">destinations</div>
          </div>
          <div className="hero-heading">
            58
            <div className="hero-subheading">countries</div>
          </div>
        </div>

        <button className="hero-button">View Flights</button>
      </div>
    </div>
  );
}