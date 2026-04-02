import { useCallback, useEffect, useRef, useState } from 'react';

export const useVideoLoadingState = (src) => {
  const [isVideoLoading, setIsVideoLoading] = useState(Boolean(src));
  const loadingTimeoutRef = useRef(null);

  useEffect(() => {
    setIsVideoLoading(Boolean(src));

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [src]);

  const handleVideoLoaded = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    setIsVideoLoading(false);
  }, []);

  const handleVideoWaiting = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    loadingTimeoutRef.current = setTimeout(() => {
      setIsVideoLoading(true);
      loadingTimeoutRef.current = null;
    }, 250);
  }, []);

  return {
    isVideoLoading,
    videoLoadingHandlers: {
      onLoadedData: handleVideoLoaded,
      onCanPlay: handleVideoLoaded,
      onCanPlayThrough: handleVideoLoaded,
      onPlaying: handleVideoLoaded,
      onWaiting: handleVideoWaiting,
      onStalled: handleVideoWaiting,
      onEmptied: handleVideoWaiting,
    },
  };
};
