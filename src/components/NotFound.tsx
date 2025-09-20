import React, { useState, useEffect } from 'react';

const NotFound: React.FC = () => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    // Generate random wrong digit (0-9 except 4)
    const possibleMistakes = [0, 1, 2, 3, 5, 6, 7, 8, 9];
    const randomMistake =
      possibleMistakes[Math.floor(Math.random() * possibleMistakes.length)];

    const sequence = [
      { text: '', delay: 500 }, // Start
      { text: '4', delay: 300 }, // Type 4
      { text: '40', delay: 300 }, // Type 0
      { text: `40${randomMistake}`, delay: 600 }, // Type random wrong digit!
      { text: '40', delay: 800 }, // Delete wrong digit (pause... "wait, that's wrong")
      { text: '404', delay: 700 }, // Type 4 (careful and deliberate)
    ];

    let timeoutId: NodeJS.Timeout;
    let currentStep = 0;

    const runAnimation = () => {
      if (currentStep < sequence.length) {
        const step = sequence[currentStep];
        timeoutId = setTimeout(() => {
          setDisplayText(step.text);
          currentStep++;
          runAnimation();
        }, step.delay);
      }
      // Animation complete - cursor keeps blinking forever!
    };

    runAnimation();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Cursor blinking effect - blinks forever!
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 600);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '72px',
        fontWeight: 'bold',
        color: 'var(--text-primary)',
        fontFamily: 'monospace',
      }}
    >
      {displayText}
      <span
        style={{
          opacity: cursorVisible ? 1 : 0,
          transition: 'opacity 0.1s',
          marginLeft: '4px',
          color: 'var(--accent-color)',
        }}
      >
        |
      </span>
    </div>
  );
};

export default NotFound;
