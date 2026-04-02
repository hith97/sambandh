import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './InstructionPage.css';
import { APP_IMAGES, APP_VIDEOS } from '../config/media';
import { useManagedVideoPlayback } from '../hooks/useManagedVideoPlayback';
import { useRef } from 'react';

const InstructionPage = ({ onStart }) => {
  const { t, lang, isPageVisible } = useLanguage();
  const videoRef = useRef(null);
  const instructionBody1 = lang === 'pa'
    ? t.instructionBody1.replace(/ਮਨਜੀਤ/g, 'ਯਸ਼ਪਾਲ')
    : t.instructionBody1.replace(/मनजीत/g, 'यशपाल');
  useManagedVideoPlayback({
    videoRef,
    isPageVisible,
    shouldPlay: true,
    shouldMute: true,
  });

  return (
    <div className="page active instruction-page-container">
      <video
        ref={videoRef}
        className="fluid-bg"
        src={APP_VIDEOS.languageBg}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />

      <div className="instruction-board">
        <img src={APP_IMAGES.frame} alt="board" className="board-bg" loading="eager" decoding="async" />

        <div className="board-content instruction-board-content">
          <h1 className="instruction-title">{t.instructionTitleText}</h1>

          <div className="instruction-text-container">
            <p className="instruction-text-body">{instructionBody1}</p>
            {t.instructionBody2 && (
              <p className="instruction-text-body">{t.instructionBody2}</p>
            )}
          </div>

          <button className="play-action-btn" onClick={onStart}>
            <img src={APP_IMAGES.buttonPrimary} alt="play bg" className="btn-bg" loading="eager" decoding="async" />
            <span className="btn-text">{t.playBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionPage;
