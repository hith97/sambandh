import React from 'react';
import './Timer.css';

const Timer = ({ time }) => {
  return (
    <div className="timer-widget">
      <div className="timer-circle">
        <span className="timer-text">{time}</span>
      </div>
    </div>
  );
};

export default Timer;
