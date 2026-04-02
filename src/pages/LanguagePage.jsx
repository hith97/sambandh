import { useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguagePage.css';
import { APP_IMAGES, APP_VIDEOS } from '../config/media';
import { useManagedVideoPlayback } from '../hooks/useManagedVideoPlayback';

const LanguagePage = ({ onComplete }) => {
  const { lang, setLang, isMuted, setIsMuted, shouldMuteAll, isPageVisible } = useLanguage();
  const videoRef = useRef(null);

  useManagedVideoPlayback({
    videoRef,
    isPageVisible,
    shouldPlay: true,
    shouldMute: shouldMuteAll,
  });

  return (
    <div className="page active lang-page-container">
      <video
        ref={videoRef}
        className="fluid-bg"
        src={APP_VIDEOS.languageBg}
        autoPlay
        loop
        controls={false}
        muted={shouldMuteAll}
        playsInline
        disablePictureInPicture
        preload="auto"
      />

      <button className="volume-btn" onClick={() => setIsMuted(!isMuted)}>
        <img src={APP_IMAGES.volumeButton} alt="volume" loading="eager" decoding="async" />
        {isMuted ? (
          <svg className="speaker-icon" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          </svg>
        ) : (
          <svg className="speaker-icon" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </button>

      <div className="lang-board">
        <img src={APP_IMAGES.frame} alt="board" className="board-bg" loading="eager" decoding="async" />

        <div className="board-content">
          <h1 className="lang-title">भाषा चुनें</h1>

          <div className="lang-buttons-container">
            <button
              className={`lang-option-btn ${lang === 'hi' ? 'active-lang' : ''}`}
              onClick={() => { setLang('hi'); onComplete(); }}
            >
              <div className="lang-option-bg"></div>
              <div className="lang-option-content">
                <span className="lang-letter hindi-letter">अ</span>
                <span className="lang-name">Hindi</span>
              </div>
            </button>

            <button
              className={`lang-option-btn ${lang === 'pa' ? 'active-lang' : ''}`}
              onClick={() => { setLang('pa'); onComplete(); }}
            >
              <div className="lang-option-bg"></div>
              <div className="lang-option-content">
                <span className="lang-letter punjabi-letter">ੳ</span>
                <span className="lang-name">Punjabi</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguagePage;
