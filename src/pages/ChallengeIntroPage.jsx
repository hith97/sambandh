import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './ChallengeIntroPage.css';
import './TransitionVideoPage.css';
import './ChallengePage.css';
import { APP_VIDEOS } from '../config/media';
import { APP_IMAGES } from '../config/media';
import HappinessMeter from '../components/HappinessMeter';
import SettingsMenu from '../components/SettingsMenu';
import { useManagedVideoPlayback } from '../hooks/useManagedVideoPlayback';
import { useIOSVoiceoverPlayback } from '../hooks/useIOSVoiceoverPlayback';
import { useResolvedVideoSource } from '../hooks/useResolvedVideoSource';
import { getIOSVoiceoverSrc } from '../config/media';

const ChallengeIntroPage = ({ onStart, onPrevious, onRestartGame, happinessScore, initialSeekTime = 0, navigationMode = 'flow' }) => {
  const videoRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const { shouldMuteAll, isPageVisible, isMuted, setIsMuted, setIsGamePaused, hasUserInteracted, isIOSLikeDevice } = useLanguage();
  const shouldMuteVideo = shouldMuteAll || !hasUserInteracted || isIOSLikeDevice;
  const { resolvedSrc, handleVideoError } = useResolvedVideoSource({ src: APP_VIDEOS.challengeIntro, useIOSOverrides: isIOSLikeDevice });

  useManagedVideoPlayback({
    videoRef,
    isPageVisible,
    shouldPlay: !isPaused,
    shouldMute: shouldMuteVideo,
  });

  useIOSVoiceoverPlayback({
    videoRef,
    audioSrc: getIOSVoiceoverSrc(APP_VIDEOS.challengeIntro),
    mediaKey: APP_VIDEOS.challengeIntro,
    enabled: isIOSLikeDevice,
    shouldPlay: !isPaused,
    shouldMute: shouldMuteAll,
    isPageVisible,
    hasUserInteracted,
  });

  const handleVideoEnd = () => {
    if (navigationMode === 'browse') {
      return;
    }

    onStart();
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => {
      const nextIsPaused = !prev;

      if (prev && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }

      return nextIsPaused;
    });
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  useEffect(() => {
    setIsGamePaused(isPaused);

    return () => {
      setIsGamePaused(false);
    };
  }, [isPaused, setIsGamePaused]);

  const applyInitialSeekTime = () => {
    const videoElement = videoRef.current;

    if (!videoElement || initialSeekTime <= 0) return;

    if (Math.abs(videoElement.currentTime - initialSeekTime) < 0.2) return;

    try {
      videoElement.currentTime = initialSeekTime;
    } catch {
      // Ignore transient seek errors until metadata is fully ready.
    }
  };

  return (
    <div className="page active challenge-intro-video-page">
      <video
        ref={videoRef}
        className="challenge-intro-video"
        src={resolvedSrc}
        autoPlay
        controls={false}
        muted={shouldMuteVideo}
        playsInline
        disablePictureInPicture
        preload="auto"
        onError={handleVideoError}
        onLoadedMetadata={applyInitialSeekTime}
        onCanPlay={applyInitialSeekTime}
        onEnded={handleVideoEnd}
      />

      <div className="challenge-intro-top-hud">
        <div className="hud-left">
          <SettingsMenu
            isMuted={isMuted}
            isPaused={isPaused}
            onTogglePause={handleTogglePause}
            onToggleMute={handleToggleMute}
            onHome={onRestartGame}
          />
        </div>
        <div className="challenge-intro-meter">
          <HappinessMeter score={happinessScore} />
        </div>
      </div>

      {isPaused && (
        <div className="paused-screen-overlay">
          <button type="button" className="paused-screen-resume-btn" onClick={handleTogglePause}>
            <img src={APP_IMAGES.playIcon} alt="resume game" className="paused-screen-icon" />
          </button>
        </div>
      )}

      <div className="video-arrow-nav challenge-intro-arrow-nav">
        <button type="button" className="video-arrow-btn" onClick={onStart}>
          <img src={APP_IMAGES.arrowIcon} alt="next page" className="video-arrow-icon mirrored" />
        </button>
      </div>
    </div>
  );
};

export default ChallengeIntroPage;
