import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './EndPage.css';
import { APP_VIDEOS, getIOSVoiceoverSrc } from '../config/media';
import { useManagedVideoPlayback } from '../hooks/useManagedVideoPlayback';
import { useRef } from 'react';
import { useIOSVoiceoverPlayback } from '../hooks/useIOSVoiceoverPlayback';
import { useResolvedVideoSource } from '../hooks/useResolvedVideoSource';

const EndPage = ({ onProceed }) => {
  const { t, shouldMuteAll, isPageVisible, hasUserInteracted, isIOSLikeDevice } = useLanguage();
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const videoRef = useRef(null);
  const shouldMuteVideo = shouldMuteAll || !hasUserInteracted || isIOSLikeDevice;
  const { resolvedSrc, handleVideoError } = useResolvedVideoSource({ src: APP_VIDEOS.end, useIOSOverrides: isIOSLikeDevice });

  useManagedVideoPlayback({
    videoRef,
    isPageVisible,
    shouldPlay: !isVideoEnded,
    shouldMute: shouldMuteVideo,
  });

  useIOSVoiceoverPlayback({
    videoRef,
    audioSrc: getIOSVoiceoverSrc(APP_VIDEOS.end),
    mediaKey: APP_VIDEOS.end,
    enabled: isIOSLikeDevice,
    shouldPlay: !isVideoEnded,
    shouldMute: shouldMuteAll,
    isPageVisible,
    hasUserInteracted,
  });

  return (
    <div className="page active end-page-container">
      <video
        ref={videoRef}
        src={resolvedSrc}
        className="end-video-bg"
        autoPlay
        muted={shouldMuteVideo}
        playsInline
        preload="auto"
        onError={handleVideoError}
        onEnded={() => setIsVideoEnded(true)}
      />

      {isVideoEnded && (
        <div className="end-video-overlay">
          <div className="end-video-stage">
            <button className="cashback-btn-video" onClick={onProceed}>
              {t.endPageBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EndPage;
