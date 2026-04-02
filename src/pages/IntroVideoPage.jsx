import React, { useRef } from 'react';
import './IntroVideoPage.css';
import { APP_VIDEOS } from '../config/media';
import ScreenLoadingOverlay from '../components/ScreenLoadingOverlay';
import { useScreenMediaReady } from '../hooks/useScreenMediaReady';
import { useLanguage } from '../context/LanguageContext';
import { useManagedVideoPlayback } from '../hooks/useManagedVideoPlayback';
import { useVideoLoadingState } from '../hooks/useVideoLoadingState';

const IntroVideoPage = ({ onComplete }) => {
  const videoRef = useRef(null);
  const { isReady, markAssetLoaded } = useScreenMediaReady([{ id: 'intro-video', type: 'video', src: APP_VIDEOS.intro }]);
  const { isPageVisible } = useLanguage();
  const { isVideoLoading, videoLoadingHandlers } = useVideoLoadingState(APP_VIDEOS.intro);

  useManagedVideoPlayback({
    videoRef,
    isPageVisible,
    shouldPlay: !isVideoLoading,
    shouldMute: true,
  });

  const handleVideoEnd = () => {
    onComplete();
  };

  return (
    <div className="intro-video-page">
      <video
        ref={videoRef}
        className="intro-video"
        src={APP_VIDEOS.intro}
        style={{ visibility: !isReady || isVideoLoading ? 'hidden' : 'visible' }}
        autoPlay
        controls={false}
        muted
        playsInline
        disablePictureInPicture
        preload="auto"
        onLoadedData={() => {
          markAssetLoaded('intro-video');
          videoLoadingHandlers.onLoadedData();
        }}
        onCanPlay={videoLoadingHandlers.onCanPlay}
        onCanPlayThrough={videoLoadingHandlers.onCanPlayThrough}
        onPlaying={videoLoadingHandlers.onPlaying}
        onWaiting={videoLoadingHandlers.onWaiting}
        onStalled={videoLoadingHandlers.onStalled}
        onSeeking={videoLoadingHandlers.onSeeking}
        onEmptied={videoLoadingHandlers.onEmptied}
        onSuspend={videoLoadingHandlers.onSuspend}
        onEnded={handleVideoEnd}
      />
      <ScreenLoadingOverlay visible={!isReady || isVideoLoading} />
    </div>
  );
};

export default IntroVideoPage;
