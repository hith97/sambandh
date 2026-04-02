import { useCallback, useEffect, useState } from 'react';
import { getPreferredVideoSrc } from '../config/media';

export const useResolvedVideoSource = ({ src, useIOSOverrides = false }) => {
  const [resolvedSrc, setResolvedSrc] = useState(() => getPreferredVideoSrc(src, useIOSOverrides));

  useEffect(() => {
    setResolvedSrc(getPreferredVideoSrc(src, useIOSOverrides));
  }, [src, useIOSOverrides]);

  const handleVideoError = useCallback(() => {
    if (!src) return;
    setResolvedSrc((currentSrc) => (currentSrc === src ? currentSrc : src));
  }, [src]);

  return { resolvedSrc, handleVideoError };
};
