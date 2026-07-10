import React, { useState, useEffect, useRef } from "react";
import "./Zai.css";

export default function Zai() {
  const [zaiState, setZaiState] = useState("sleeping"); // "sleeping", "waking", "awake"
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const containerRef = useRef(null);
  const sleepTimeoutRef = useRef(null);

  const GREETINGS = [
    "hi, I'm Zai.",
    "Your favorite Zai is here.",
    "Finally! Zai's favorite human.",
    "Zai knew you'd come back.",
    "You're Zai's favorite visitor.",
    "Zai woke up for you."
  ];
  const [greetingIndex, setGreetingIndex] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const zaiX = rect.left + rect.width / 2;
      const zaiY = rect.top + rect.height / 2;

      // Distance from mouse to Zai center
      const distance = Math.hypot(e.clientX - zaiX, e.clientY - zaiY);

      if (distance < 75) {
        // Wake up Zai!
        if (sleepTimeoutRef.current) {
          clearTimeout(sleepTimeoutRef.current);
          sleepTimeoutRef.current = null;
        }

        if (zaiState === "sleeping") {
          setZaiState("waking");
          setGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
          // Smooth transition from waking to fully awake waving
          setTimeout(() => {
            setZaiState("awake");
            setBubbleVisible(true);
          }, 600);
        }
      } else {
        // Cursor moved away: schedule going back to sleep quickly (1 second delay)
        if (zaiState === "awake" || zaiState === "waking") {
          if (!sleepTimeoutRef.current) {
            sleepTimeoutRef.current = setTimeout(() => {
              setBubbleVisible(false);
              // Wait for bubble to fade out before sleeping eyes
              setTimeout(() => {
                setZaiState("sleeping");
              }, 300);
            }, 1000);
          }
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (sleepTimeoutRef.current) {
        clearTimeout(sleepTimeoutRef.current);
      }
    };
  }, [zaiState]);

  // Wake up immediately on direct mouse hover
  const handleMouseEnter = () => {
    if (sleepTimeoutRef.current) {
      clearTimeout(sleepTimeoutRef.current);
      sleepTimeoutRef.current = null;
    }
    if (zaiState === "sleeping") {
      setZaiState("waking");
      setGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
      setTimeout(() => {
        setZaiState("awake");
        setBubbleVisible(true);
      }, 600);
    }
  };

  return (
    <div 
      className={`zai-outer-container zai-state-${zaiState}`} 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
    >
      {/* Speech Bubble */}
      <div className={`zai-speech-bubble ${bubbleVisible ? "visible" : ""}`}>
        {GREETINGS[greetingIndex]}
      </div>

      <div className={`zai-body-wrapper ${zaiState === "sleeping" ? "zai-breathing" : ""}`}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 200 200" 
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Filter to add subtle depth drop shadow specifically to the arm/paw */}
            <filter id="zai-hand-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="-3" dy="3" stdDeviation="3" floodOpacity="0.15" floodColor="#000000" />
            </filter>
          </defs>

          {/* Main Body Robe */}
          <path 
            d="M 80 135 C 80 135, 60 170, 50 195 L 150 195 C 140 170, 120 135, 120 135 Z" 
            fill="#f4f1ea" 
            stroke="#e5dfd5"
            strokeWidth="1.5"
          />

          {/* Head & Face Group */}
          <g className={`zai-head-group zai-head-${zaiState}`}>
            {/* Hood Shadow / Collar */}
            <ellipse cx="100" cy="138" rx="28" ry="8" fill="#e5dfd5" />

            {/* Head Outer Sphere (Hood) */}
            <circle 
              cx="100" 
              cy="85" 
              r="54" 
              fill="#f4f1ea" 
              stroke="#e5dfd5" 
              strokeWidth="1.5" 
            />
            
            {/* Visor Cutout for Face */}
            <path 
              d="M 62 100 C 62 82, 138 82, 138 100 C 138 116, 62 116, 62 100 Z" 
              fill="#f7d1ba" 
            />
            
            {/* Inner Visor Shadow */}
            <path 
              d="M 62 100 C 62 82, 138 82, 138 100" 
              fill="none" 
              stroke="rgba(0,0,0,0.06)" 
              strokeWidth="3" 
            />

            {/* Eyes & Mouth states */}
            {zaiState === "sleeping" ? (
              <>
                {/* Sleep Arc Eyes */}
                <path d="M 76 99 Q 82 104 88 99" fill="none" stroke="#2b2d42" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 112 99 Q 118 104 124 99" fill="none" stroke="#2b2d42" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Awake / Waving Eyes with Blinking */}
                <ellipse cx="82" cy="99" rx="5" ry="9" fill="#111" className="zai-eye-blink" style={{ transformOrigin: "82px 99px" }} />
                <ellipse cx="118" cy="99" rx="5" ry="9" fill="#111" className="zai-eye-blink" style={{ transformOrigin: "118px 99px" }} />
                {/* Cute Smiling Mouth */}
                <path d="M 96 107 Q 100 111 104 107" fill="none" stroke="#e5989b" strokeWidth="2.5" strokeLinecap="round" />
              </>
            )}
          </g>

          {/* Left Waving Arm (w/ drop shadow filter and slightly deeper cream tone + darker stroke outline for high readability) */}
          <g 
            className={`zai-arm-group zai-arm-${zaiState}`}
            style={{ transformOrigin: "78px 140px" }}
            filter="url(#zai-hand-shadow)"
          >
            <path 
              d="M 80 142 Q 54 116 44 92 C 34 82, 54 82, 58 92 Q 66 116 80 142 Z" 
              fill="#ece8df" 
              stroke="#d4ccc0"
              strokeWidth="1.5"
            />
            <circle 
              cx="50" 
              cy="88" 
              r="14" 
              fill="#ece8df" 
              stroke="#d4ccc0"
              strokeWidth="1.5"
            />
          </g>

          {/* Right Arm (hanging relaxed downward at the side, remaining still/down) */}
          <g 
            className={`zai-arm-right zai-arm-right-${zaiState}`}
            style={{ transformOrigin: "122px 138px" }}
            filter="url(#zai-hand-shadow)"
          >
            <path 
              d="M 120 138 Q 125 155 128 172 C 130 180, 144 180, 142 172 Q 137 155 130 138 Z" 
              fill="#ece8df" 
              stroke="#d4ccc0"
              strokeWidth="1.5"
            />
            <circle 
              cx="135" 
              cy="172" 
              r="12" 
              fill="#ece8df" 
              stroke="#d4ccc0"
              strokeWidth="1.5"
            />
          </g>

          {/* Floating Zzz sleeping effects (larger size + 5 sequential elements) */}
          {zaiState === "sleeping" && (
            <g className="zai-zzz-group">
              <text x="135" y="55" className="zai-zzz zai-zzz-1">z</text>
              <text x="142" y="46" className="zai-zzz zai-zzz-2">Z</text>
              <text x="148" y="38" className="zai-zzz zai-zzz-3">Z</text>
              <text x="156" y="28" className="zai-zzz zai-zzz-4">Z</text>
              <text x="162" y="22" className="zai-zzz zai-zzz-5">z</text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
