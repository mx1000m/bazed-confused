import React, { useEffect, useState } from 'react';
import './PointsCelebration.css';

const PointsCelebration = ({ show, onComplete }) => {
  const [visible, setVisible] = useState(false);
  const [confettiItems, setConfettiItems] = useState([]);
  
  // Generate random confetti pieces when component mounts
  useEffect(() => {
    if (show) {
      // Generate confetti pieces
      const items = [];
      const colors = ['#0052FF', '#0038c7', '#0e5bf7', '#0046e0', '#0d55e4'];
      
      for (let i = 0; i < 50; i++) {
        items.push({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size: Math.random() * 0.8 + 0.4, // Size between 0.4 and 1.2
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          delay: Math.random() * 0.5
        });
      }
      
      setConfettiItems(items);
      setVisible(true);
      
      // Hide after animation completes
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) {
          setTimeout(onComplete, 500); // Give a bit of time for fade out
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);
  
  if (!show && !visible) return null;
  
  return (
    <div className={`points-celebration ${visible ? 'visible' : 'hidden'}`}>
      <div className="points-text">+10pts</div>
      
      {/* Confetti */}
      {confettiItems.map(item => (
        <div 
          key={item.id}
          className="confetti-piece"
          style={{
            left: item.left,
            top: item.top,
            transform: `scale(${item.size}) rotate(${item.rotation}deg)`,
            backgroundColor: item.color,
            animationDelay: `${item.delay}s`
          }}
        />
      ))}
    </div>
  );
};

export default PointsCelebration;