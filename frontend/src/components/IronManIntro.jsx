import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import "./IronManIntro.css";

export default function IronManIntro() {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    let start = performance.now();
    const duration = 4000; // slightly longer for a dramatic reveal

    function animate(now) {
      const p = Math.min((now - start) / duration, 1);
      // Use an ease-in-out or ease-out curve for better feel
      const easeP = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setProgress(easeP);

      if (p < 1) {
        requestAnimationFrame(animate);
      }
    }

    // small delay before starting
    const timeout = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  const progressPercent = progress * 100;

  return (
    <div className="intro-container" ref={containerRef}>
      
      {/* Background Dimmed Text (Silhouette) */}
      <div className="text-background">
        <div className="text-content">
          <h1>Event Intro - Biggest Event of the Year</h1>
          <h3>PSG COLLEGE OF TECHNOLOGY & IEEE SC 12951</h3>
          <h2>Presents this</h2>
        </div>
      </div>

      {/* Revealed Text Foreground (Marvel Colors) */}
      <div 
        className="text-revealed"
        style={{
          clipPath: `inset(0 ${100 - progressPercent}% 0 0)`
        }}
      >
        <div className="text-content">
          <h1>Event Intro - Biggest Event of the Year</h1>
          <h3>PSG COLLEGE OF TECHNOLOGY & IEEE SC 12951</h3>
          <h2>Presents this</h2>
        </div>
      </div>

      {/* Iron Man & Jet Flames */}
      <motion.div
        className="ironman-container"
        style={{
          left: `calc(${progressPercent}% - 60px)` // align toy exactly at the reveal edge
        }}
      >
        <motion.div
          className="flame"
          animate={{
            scaleX: [1, 1.3, 0.9, 1.2, 1],
            scaleY: [1, 1.1, 0.9, 1.1, 1],
            opacity: [0.8, 1, 0.7, 0.9, 0.8]
          }}
          transition={{ repeat: Infinity, duration: 0.2 }}
        />
        <motion.div
          className="ironman-emoji"
          animate={{
            y: [0, -8, 2, -5, 0],
            rotate: [0, 5, -2, 3, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 0.5,
            ease: "easeInOut"
          }}
        >
          🤖
        </motion.div>
      </motion.div>

    </div>
  );
}
