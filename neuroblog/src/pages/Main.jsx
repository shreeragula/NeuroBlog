import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroBackground from "../components/HeroBackground";
import "./Main.css";

export default function Main() {
  const navigate = useNavigate();

  const sentence1 = "Every idea deserves an audience.";
  const sentence2 = "Write insightful blogs, learn from others, and become part of a thriving community of creators and readers.";

  const [typed1, setTyped1] = useState("");
  const [typed2, setTyped2] = useState("");
  const [showCursor1, setShowCursor1] = useState(true);
  const [showCursor2, setShowCursor2] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < sentence1.length) {
        setTyped1(sentence1.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setShowCursor1(false);
        setShowCursor2(true);
        let j = 0;
        const intervalnd = setInterval(() => {
          if (j < sentence2.length) {
            setTyped2(sentence2.slice(0, j + 1));
            j++;
          } else {
            clearInterval(intervalnd);
            setTimeout(() => {
              setShowCursor2(false);
            }, 3000);
          }
        }, 30);
      }
    }, 40);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="main-bg">
      <HeroBackground />
      <header>
        <div className="logo">Neuroblog</div>
        <nav>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <button className="btn" onClick={() => navigate("/login")}>
            Signin
          </button>
          <button className="btn" onClick={() => navigate("/signup")}>
            Signup
          </button>
        </nav>
      </header>

      <section className="hero">
        <img src="/icons.png" alt="Blogging icons" />
        <h1>Share Your Knowledge With the World</h1>
        <p className="hero-subtext-bold">
          {typed1}
          {showCursor1 && <span className="typewriter-cursor">|</span>}
        </p>
        <p className="hero-subtext">
          {typed2}
          {showCursor2 && <span className="typewriter-cursor">|</span>}
        </p>
      </section>

      <section id="about">
        <div className="glass-panel">
          <h2>About the Website</h2>
          <p>
            Neuroblog is a simple and modern blogging platform where you can
            publish your thoughts, tutorials, and ideas. It combines ease of use
            with elegant motion effects for a delightful experience.
            With our integrated AI Blog Generator, you can create engaging, 
            well-structured blogs in seconds and bring your ideas to life effortlessly.
          </p>
        </div>
      </section>

      <section id="contact">
        <div className="glass-panel">
          <h2>Contact Us</h2>
          <p>Email: <a href="mailto:neuroblog08@gmail.com" className="contact-link">neuroblog08@gmail.com</a></p>
          <p>Phone: +91-9398142461</p>
        </div>
      </section>

      <footer>© 2025 NeuroBlog — Built with ♥</footer>
    </div>
  );
}
