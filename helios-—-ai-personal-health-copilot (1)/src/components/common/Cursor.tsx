import React, { useEffect, useState } from 'react';

export function Cursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailing, setTrailing] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      setPosition({ x: e.clientX, y: e.clientY });

      // Check if target is clickable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.closest('button') ||
          target.closest('a') ||
          target.getAttribute('role') === 'button' ||
          target.classList.contains('cursor-pointer') ||
          target.classList.contains('interactive-node'))
      ) {
        setIsPointer(true);
      } else {
        setIsPointer(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Smooth trail animation
  useEffect(() => {
    if (isTouch) return;
    let animId: number;
    const follow = () => {
      setTrailing((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.18,
        y: prev.y + (position.y - prev.y) * 0.18,
      }));
      animId = requestAnimationFrame(follow);
    };
    animId = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(animId);
  }, [position, isTouch]);

  if (isTouch || !isVisible) return null;

  return (
    <>
      {/* Precision inner dot */}
      <div
        className="pointer-events-none fixed z-50 rounded-full transition-transform duration-75 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${isPointer ? 0.6 : 1})`,
          width: '6px',
          height: '6px',
          backgroundColor: '#67e8f9',
          boxShadow: '0 0 10px #22d3ee',
        }}
      />
      {/* Ambient trailing glow ring */}
      <div
        className="pointer-events-none fixed z-50 rounded-full transition-[width,height,border-color,background-color] duration-200 ease-out"
        style={{
          left: `${trailing.x}px`,
          top: `${trailing.y}px`,
          transform: 'translate(-50%, -50%)',
          width: isPointer ? '44px' : '26px',
          height: isPointer ? '44px' : '26px',
          border: isPointer ? '1.5px solid rgba(103, 232, 249, 0.7)' : '1px solid rgba(255, 255, 255, 0.25)',
          backgroundColor: isPointer ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
          boxShadow: isPointer ? '0 0 24px rgba(6, 182, 212, 0.35)' : 'none',
        }}
      />
    </>
  );
}
