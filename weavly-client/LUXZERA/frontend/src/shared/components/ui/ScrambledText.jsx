'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './ScrambledText.css';

const ScrambledText = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = '.:',
  className = '',
  style = {},
  children
}) => {
  const rootRef = useRef(null);
  const charsRef = useRef([]);

  useEffect(() => {
    if (!rootRef.current) return;

    const el = rootRef.current;

    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text) return;
        
        const frag = document.createDocumentFragment();
        const chars = Array.from(text);
        
        chars.forEach((char) => {
          if (char === '\n') return;
          const span = document.createElement('span');
          span.className = 'scrambled-char';
          span.setAttribute('data-content', char);
          span.textContent = char;
          frag.appendChild(span);
        });
        
        if (node.parentNode) {
          node.parentNode.replaceChild(frag, node);
        }
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.tagName !== 'IMG' &&
        node.tagName !== 'SVG' &&
        !node.classList?.contains('scrambled-char')
      ) {
        Array.from(node.childNodes).forEach(processNode);
      }
    };

    Array.from(el.childNodes).forEach(processNode);

    const charElements = Array.from(el.querySelectorAll('.scrambled-char'));
    charsRef.current = charElements;

    // Lock character widths to initial width so layout NEVER shifts during scramble
    requestAnimationFrame(() => {
      charElements.forEach((c) => {
        const char = c.getAttribute('data-content');
        if (char && char !== ' ') {
          const w = c.getBoundingClientRect().width;
          if (w > 0) {
            c.style.width = `${w}px`;
          }
        }
      });
    });

    const handleMove = (e) => {
      const chars = scrambleChars || '.:';
      charsRef.current.forEach((c) => {
        const targetChar = c.getAttribute('data-content');
        if (targetChar === ' ' || !targetChar || c.dataset.animating === 'true') return;

        const rect = c.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          c.dataset.animating = 'true';
          const effectDuration = Math.max(0.2, duration * (1 - dist / radius));
          const steps = Math.max(3, Math.floor(effectDuration * 20 * speed));
          
          let step = 0;

          gsap.to(c, {
            duration: effectDuration,
            ease: 'power1.out',
            onUpdate: () => {
              step++;
              if (step >= steps) {
                c.textContent = targetChar;
              } else {
                const randomChar = chars[Math.floor(Math.random() * chars.length)];
                c.textContent = randomChar;
              }
            },
            onComplete: () => {
              c.textContent = targetChar;
              c.dataset.animating = 'false';
            }
          });
        }
      });
    };

    el.addEventListener('pointermove', handleMove);

    return () => {
      el.removeEventListener('pointermove', handleMove);
    };
  }, [radius, duration, speed, scrambleChars]);

  return (
    <div ref={rootRef} className={`scrambled-text-root ${className}`} style={style}>
      {children}
    </div>
  );
};

export default ScrambledText;
