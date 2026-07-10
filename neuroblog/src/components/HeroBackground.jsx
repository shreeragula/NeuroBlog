import React from "react";
import "./HeroBackground.css";

export default function HeroBackground() {
  return (
    <div className="hero-background-container">
      <video
        className="hero-background-video"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      {/* Ambient glassmorphic overlays and moving light blobs */}
      <div className="hero-background-overlay" />
      <div className="hero-background-glow-1" />
      <div className="hero-background-glow-2" />
    </div>
  );
}
