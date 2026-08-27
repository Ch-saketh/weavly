// src/shared/components/ui/TypewriterText.jsx
import { useState, useEffect } from "react";

export default function TypewriterText({ text, speed = 25, delay = 0, className = "" }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsDone(false);

    let currentIndex = 0;
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsDone(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay]);

  return (
    <span className={`inline-block ${className}`}>
      {displayedText}
      {!isDone && (
        <span className="inline-block w-[2px] h-[1em] bg-[#F07020] ml-0.5 align-middle animate-pulse" />
      )}
    </span>
  );
}
