import React from "react";
import "./Hero.css";
import hero_image from "../Assets/hero_image.png";
import hand_icon from "../Assets/hand_icon.png";
import arrow_icon from "../Assets/arrow.png";

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-left">
        <div className="hero-text">
          <div className="text-line">
            <span className="letter">E</span>
            <span className="letter">L</span>
            <span className="letter">E</span>
            <span className="letter">V</span>
            <span className="letter">A</span>
            <span className="letter">T</span>
            <span className="letter">E</span>
            <span className="letter space">&nbsp;</span>
            <span className="letter">Y</span>
            <span className="letter">O</span>
            <span className="letter">U</span>
            <span className="letter">R</span>
          </div>
          <div className="text-line">
            <span className="letter">W</span>
            <span className="letter">A</span>
            <span className="letter">R</span>
            <span className="letter">D</span>
            <span className="letter">R</span>
            <span className="letter">O</span>
            <span className="letter">B</span>
            <span className="letter">E</span>
          </div>
        </div>
        <div className="hero-latest-btn" onClick={() => document.getElementById('new-collections').scrollIntoView({ behavior: 'smooth' })}>
          <div>Latest Collection</div>
        </div>
      </div>
      <div className="hero-right">
        <img src={hero_image} alt="hero" />
      </div>
    </div>
  );
};

export default Hero;
