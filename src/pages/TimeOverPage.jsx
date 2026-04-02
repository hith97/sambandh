import React, { useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './TimeOverPage.css';
import { APP_AUDIO, APP_IMAGES } from '../config/media';

const TimeOverPage = ({ onContinue }) => {
  const { t, shouldMuteAll } = useLanguage();
  const audioRef = useRef(typeof window !== 'undefined' && typeof Audio !== 'undefined' ? new Audio(APP_AUDIO.timeOver) : null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = shouldMuteAll;
    }

    if (audioRef.current && !shouldMuteAll) {
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [shouldMuteAll]);

  return (
    <div className="page active time-over-container">
      <img src={APP_IMAGES.bgFallback} alt="background" className="fluid-bg" loading="eager" decoding="async" />
      <div className="time-over-content-wrapper">
        <div className="time-over-frame-container">
          <div className="time-over-frame-content">
            <h1 className="time-over-text">
              {t.timeOverTitle || 'Time Over!'}
            </h1>
            <button className="continue-btn" onClick={onContinue}>{t.tryAgainBtn}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeOverPage;
