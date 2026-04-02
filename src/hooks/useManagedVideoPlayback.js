import { useEffect } from 'react';

const MAX_PLAY_RETRIES = 8;
const READY_STATE_TO_PLAY = 2;

export const useManagedVideoPlayback = ({ videoRef, isPageVisible, shouldPlay = true, shouldMute = false }) => {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let retryTimeoutId = null;
    let retryCount = 0;
    let isDisposed = false;

    const clearRetry = () => {
      if (retryTimeoutId) {
        window.clearTimeout(retryTimeoutId);
        retryTimeoutId = null;
      }
    };

    const scheduleRetry = (delay = 200) => {
      clearRetry();

      if (retryCount >= MAX_PLAY_RETRIES) {
        return;
      }

      retryTimeoutId = window.setTimeout(() => {
        retryTimeoutId = null;
        retryCount += 1;
        syncPlayback();
      }, delay);
    };

    const syncPlayback = () => {
      const currentVideo = videoRef.current;
      if (!currentVideo || isDisposed) return;

      currentVideo.muted = shouldMute;
      currentVideo.defaultMuted = shouldMute;
      currentVideo.autoplay = true;
      currentVideo.controls = false;
      currentVideo.disablePictureInPicture = true;
      currentVideo.playsInline = true;
      currentVideo.preload = 'auto';
      currentVideo.setAttribute('autoplay', '');
      currentVideo.setAttribute('playsinline', 'true');
      currentVideo.setAttribute('webkit-playsinline', 'true');

      if (shouldMute) {
        currentVideo.setAttribute('muted', '');
      } else {
        currentVideo.removeAttribute('muted');
      }

      if (!shouldPlay || !isPageVisible) {
        clearRetry();
        if (!currentVideo.paused) {
          currentVideo.pause();
        }
        return;
      }

      if (currentVideo.networkState === HTMLMediaElement.NETWORK_EMPTY) {
        currentVideo.load();
      }

      if (currentVideo.readyState < READY_STATE_TO_PLAY) {
        scheduleRetry();
        return;
      }

      const playPromise = currentVideo.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            retryCount = 0;
            clearRetry();
          })
          .catch(() => {
            scheduleRetry();
          });
      } else {
        retryCount = 0;
        clearRetry();
      }
    };

    const handlePlaying = () => {
      retryCount = 0;
      clearRetry();
    };

    const replayReadyEvents = [
      'loadedmetadata',
      'loadeddata',
      'canplay',
      'canplaythrough',
      'suspend',
      'stalled',
      'waiting',
    ];
    const interactionEvents = ['pointerdown', 'touchstart', 'click'];

    syncPlayback();

    replayReadyEvents.forEach((eventName) => {
      video.addEventListener(eventName, syncPlayback);
    });
    video.addEventListener('playing', handlePlaying);
    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, syncPlayback, { passive: true });
    });

    return () => {
      isDisposed = true;
      clearRetry();

      replayReadyEvents.forEach((eventName) => {
        video.removeEventListener(eventName, syncPlayback);
      });
      video.removeEventListener('playing', handlePlaying);
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, syncPlayback);
      });
    };
  }, [videoRef, isPageVisible, shouldPlay, shouldMute]);
};
