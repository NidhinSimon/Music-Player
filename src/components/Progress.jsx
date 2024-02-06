import React from 'react';
import '../App.css';

const ProgressBar = ({ currentTime, duration, onSeek }) => {
  const calculatePercentage = () => {
    return (currentTime / duration) * 100;
  };

  const handleSeek = (e) => {
    const seekTime = (e.nativeEvent.offsetX / e.target.offsetWidth) * duration;
    onSeek(seekTime);
  };

  return (
    <div className="progress-bar" onClick={handleSeek}>
      <div className="progress" style={{ width: `${calculatePercentage()}%` }}></div>
    </div>
  );
};

export default ProgressBar;
