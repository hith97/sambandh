import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import HappinessMeter from '../components/HappinessMeter';
import SettingsMenu from '../components/SettingsMenu';
import './TransitionVideoPage.css';
import './ChallengePage.css';
import { useManagedVideoPlayback } from '../hooks/useManagedVideoPlayback';
import { APP_IMAGES, APP_VIDEOS, getIOSVoiceoverSrc } from '../config/media';
import { useIOSVoiceoverPlayback } from '../hooks/useIOSVoiceoverPlayback';
import { useResolvedVideoSource } from '../hooks/useResolvedVideoSource';

const TransitionVideoPage = ({ videoSrc, onComplete, onSkipVideo, onPreviousQuestion, onNextQuestion, bubbleTrail, happinessScore, showArrows = true, showControls = false, onRestartGame, initialSeekTime = 0 }) => {
  const videoRef = useRef(null);
  const hasAppliedInitialSeekRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const { shouldMuteAll, isPageVisible, isMuted, setIsMuted, setIsGamePaused, hasUserInteracted, isIOSLikeDevice } = useLanguage();
  const shouldMuteVideo = shouldMuteAll || !hasUserInteracted || isIOSLikeDevice;
  const { resolvedSrc, handleVideoError } = useResolvedVideoSource({ src: videoSrc, useIOSOverrides: isIOSLikeDevice });
  const replayStartTimeByVideo = {
    [APP_VIDEOS.transitionQ2]: 6,
    [APP_VIDEOS.transitionQ3]: 8,
    [APP_VIDEOS.transitionQ4]: 8,
    [APP_VIDEOS.transitionQ5]: 4.2,
  };
  const replayStartTime = replayStartTimeByVideo[videoSrc] ?? 0;
  const visibleBubbleTrail = bubbleTrail?.filter(Boolean) || [];

  useManagedVideoPlayback({
    videoRef,
    isPageVisible,
    shouldPlay: Boolean(videoSrc) && !isPaused,
    shouldMute: shouldMuteVideo,
  });

  useIOSVoiceoverPlayback({
    videoRef,
    audioSrc: getIOSVoiceoverSrc(videoSrc),
    mediaKey: `${videoSrc || ''}:${initialSeekTime}`,
    enabled: isIOSLikeDevice,
    shouldPlay: Boolean(videoSrc) && !isPaused,
    shouldMute: shouldMuteAll,
    isPageVisible,
    hasUserInteracted,
  });

  const handleVideoEnd = () => {
    onComplete();
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

  useEffect(() => {
    hasAppliedInitialSeekRef.current = false;
  }, [videoSrc, initialSeekTime]);

  const applyInitialSeekTime = () => {
    const videoElement = videoRef.current;

    if (!videoElement || initialSeekTime <= 0) return;
    if (hasAppliedInitialSeekRef.current) return;
    if (videoElement.readyState < 1) return;

    if (Math.abs(videoElement.currentTime - initialSeekTime) < 0.2) return;

    try {
      videoElement.pause();
      videoElement.currentTime = initialSeekTime;
      hasAppliedInitialSeekRef.current = true;

      if (!isPaused && isPageVisible) {
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }
    } catch {
      // Ignore transient seek errors until metadata is fully ready.
    }
  };

  useEffect(() => {
    applyInitialSeekTime();
  }, [videoSrc, initialSeekTime, isPaused, isPageVisible]);

  const handleReplayCurrentVideo = () => {
    const videoElement = videoRef.current;

    if (showControls && onPreviousQuestion) {
      onPreviousQuestion();
      return;
    }

    if (!videoElement) {
      onPreviousQuestion?.();
      return;
    }

    videoElement.currentTime = replayStartTime;
    const playPromise = videoElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  };

  return (
    <div className="page active transition-video-page">
      <video
        key={`${videoSrc}-${initialSeekTime}`}
        ref={videoRef}
        className="transition-video"
        src={resolvedSrc}
        autoPlay
        controls={false}
        muted={shouldMuteVideo}
        playsInline
        disablePictureInPicture
        preload="auto"
        onError={handleVideoError}
        onLoadedMetadata={applyInitialSeekTime}
        onLoadedData={applyInitialSeekTime}
        onCanPlay={applyInitialSeekTime}
        onEnded={handleVideoEnd}
      />

      {showControls && (
        <div className="transition-video-top-hud">
          <div className="hud-left">
            <SettingsMenu
              isMuted={isMuted}
              isPaused={isPaused}
              onTogglePause={handleTogglePause}
              onToggleMute={handleToggleMute}
              onHome={onRestartGame}
            />
          </div>
        </div>
      )}

      {showControls && isPaused && (
        <div className="paused-screen-overlay">
          <button type="button" className="paused-screen-resume-btn" onClick={handleTogglePause}>
            <img src={APP_IMAGES.playIcon} alt="resume game" className="paused-screen-icon" />
          </button>
        </div>
      )}

      {happinessScore !== undefined && (
        <div className="transition-hud">
          <HappinessMeter score={happinessScore} />
        </div>
      )}

      {showArrows && (
        <div className="video-arrow-nav">
          <button
            type="button"
            className="video-arrow-btn"
            onClick={handleReplayCurrentVideo}
            style={{
              opacity: 1,
              pointerEvents: 'auto',
            }}
          >
            <img src={APP_IMAGES.arrowIcon} alt="previous question" className="video-arrow-icon" />
          </button>
          <button
            type="button"
            className="video-arrow-btn"
            onClick={onNextQuestion || onSkipVideo || onComplete}
          >
            <img src={APP_IMAGES.arrowIcon} alt="next question" className="video-arrow-icon mirrored" />
          </button>
        </div>
      )}

      {visibleBubbleTrail.length > 0 && (
        <div className="collected-bubbles-tray transition-collected-tray">
          {visibleBubbleTrail.map((item, index) => (
            <div key={`${item.type}-${index}`} className={item.type === 'correct' ? 'correct-bubble-indicator' : 'wrong-bubble-indicator'}>
              {item.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransitionVideoPage;
