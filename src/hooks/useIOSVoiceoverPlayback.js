import { useEffect, useRef } from 'react';
import { getIOSVoiceoverContext, loadIOSVoiceoverBuffer, primeIOSVoiceoverPlayer } from '../utils/iosVoiceoverPlayer';

const MAX_SYNC_DRIFT_SECONDS = 0.18;

const clampBufferTime = (buffer, time) => {
  if (!buffer || !Number.isFinite(time) || time < 0) return 0;
  if (!Number.isFinite(buffer.duration) || buffer.duration <= 0) return time;
  return Math.min(time, Math.max(buffer.duration - 0.02, 0));
};

export const useIOSVoiceoverPlayback = ({
  videoRef,
  audioSrc,
  mediaKey = '',
  enabled = false,
  shouldPlay = true,
  shouldMute = false,
  isPageVisible = true,
  hasUserInteracted = false,
}) => {
  const audioBufferRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const startedAtRef = useRef(0);
  const startOffsetRef = useRef(0);
  const resyncIntervalRef = useRef(null);
  const shouldResumeWhenReadyRef = useRef(false);
  const loadRequestIdRef = useRef(0);

  useEffect(() => {
    if (!enabled || !audioSrc) {
      audioBufferRef.current = null;
      return undefined;
    }

    let active = true;
    const requestId = ++loadRequestIdRef.current;

    audioBufferRef.current = null;
    shouldResumeWhenReadyRef.current = true;

    loadIOSVoiceoverBuffer(audioSrc).then((buffer) => {
      if (!active || requestId !== loadRequestIdRef.current) return;
      audioBufferRef.current = buffer;
    });

    return () => {
      active = false;
      audioBufferRef.current = null;
    };
  }, [audioSrc, enabled, mediaKey]);

  useEffect(() => {
    const video = videoRef.current;
    const context = getIOSVoiceoverContext();
    if (!enabled || !video || !context) return undefined;

    if (!gainNodeRef.current) {
      gainNodeRef.current = context.createGain();
      gainNodeRef.current.connect(context.destination);
    }

    const clearResyncInterval = () => {
      if (resyncIntervalRef.current) {
        window.clearInterval(resyncIntervalRef.current);
        resyncIntervalRef.current = null;
      }
    };

    const stopAudioSource = () => {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch {
          // Ignore stop errors for already-finished sources.
        }
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
    };

    const ensureResyncInterval = () => {
      if (resyncIntervalRef.current) return;

      resyncIntervalRef.current = window.setInterval(() => {
        syncAudioToVideo(false);
      }, 150);
    };

    const getAudioPosition = () => {
      if (!sourceNodeRef.current) return null;
      return startOffsetRef.current + Math.max(0, context.currentTime - startedAtRef.current);
    };

    const startAudioAtVideoTime = async () => {
      const buffer = audioBufferRef.current;
      if (!buffer || !videoRef.current) {
        shouldResumeWhenReadyRef.current = true;
        return false;
      }

      const didPrime = await primeIOSVoiceoverPlayer();
      if (!didPrime) return false;

      if (context.state !== 'running') {
        try {
          await context.resume();
        } catch {
          return false;
        }
      }

      const nextOffset = clampBufferTime(buffer, videoRef.current.currentTime || 0);
      stopAudioSource();

      const source = context.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = videoRef.current.playbackRate || 1;
      source.connect(gainNodeRef.current);
      gainNodeRef.current.gain.value = shouldMute ? 0 : 1;

      try {
        source.start(0, nextOffset);
      } catch {
        return false;
      }

      sourceNodeRef.current = source;
      startedAtRef.current = context.currentTime;
      startOffsetRef.current = nextOffset;
      shouldResumeWhenReadyRef.current = false;
      return true;
    };

    const pauseAudio = () => {
      clearResyncInterval();
      stopAudioSource();
    };

    const startSyncedPlayback = async () => {
      if (!videoRef.current) return;

      if (shouldMute || !shouldPlay || !isPageVisible || !hasUserInteracted) {
        pauseAudio();
        return;
      }

      const audioStarted = await startAudioAtVideoTime();
      if (audioStarted) {
        ensureResyncInterval();
      }
    };

    const handleEnded = () => {
      clearResyncInterval();
      shouldResumeWhenReadyRef.current = false;
      stopAudioSource();
    };

    const handleRateChange = () => {
      if (!videoRef.current) return;
      if (!videoRef.current.paused) {
        startSyncedPlayback();
      }
    };

    const handleSeek = () => {
      if (!videoRef.current?.paused) {
        startSyncedPlayback();
      } else {
        pauseAudio();
      }
    };

    const handleTimeUpdate = () => {
      syncAudioToVideo(false);
    };

    const handleVideoPlay = () => {
      startSyncedPlayback();
    };

    const syncAudioToVideo = (force = false) => {
      if (!videoRef.current) return;
      const audioPosition = getAudioPosition();
      if (audioPosition === null) {
        if (shouldResumeWhenReadyRef.current && shouldPlay && isPageVisible && hasUserInteracted) {
          startSyncedPlayback();
        }
        return;
      }

      const videoTime = videoRef.current.currentTime || 0;
      if (force || Math.abs(audioPosition - videoTime) > MAX_SYNC_DRIFT_SECONDS) {
        startSyncedPlayback();
      }
    };

    const handleVisibilityPause = () => {
      pauseAudio();
    };

    const handleInteractionRetry = () => {
      if (shouldPlay && isPageVisible && hasUserInteracted) {
        startSyncedPlayback();
      }
    };

    video.addEventListener('play', handleVideoPlay);
    video.addEventListener('playing', handleVideoPlay);
    video.addEventListener('pause', pauseAudio);
    video.addEventListener('seeking', handleSeek);
    video.addEventListener('seeked', handleSeek);
    video.addEventListener('loadedmetadata', handleSeek);
    video.addEventListener('loadeddata', handleSeek);
    video.addEventListener('canplay', handleSeek);
    video.addEventListener('waiting', handleVisibilityPause);
    video.addEventListener('stalled', handleVisibilityPause);
    video.addEventListener('ratechange', handleRateChange);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    window.addEventListener('pointerdown', handleInteractionRetry);
    window.addEventListener('touchstart', handleInteractionRetry);
    window.addEventListener('click', handleInteractionRetry);

    if (shouldPlay && isPageVisible) {
      startSyncedPlayback();
    } else {
      pauseAudio();
    }

    return () => {
      clearResyncInterval();
      shouldResumeWhenReadyRef.current = false;
      video.removeEventListener('play', handleVideoPlay);
      video.removeEventListener('playing', handleVideoPlay);
      video.removeEventListener('pause', pauseAudio);
      video.removeEventListener('seeking', handleSeek);
      video.removeEventListener('seeked', handleSeek);
      video.removeEventListener('loadedmetadata', handleSeek);
      video.removeEventListener('loadeddata', handleSeek);
      video.removeEventListener('canplay', handleSeek);
      video.removeEventListener('waiting', handleVisibilityPause);
      video.removeEventListener('stalled', handleVisibilityPause);
      video.removeEventListener('ratechange', handleRateChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      window.removeEventListener('pointerdown', handleInteractionRetry);
      window.removeEventListener('touchstart', handleInteractionRetry);
      window.removeEventListener('click', handleInteractionRetry);
      pauseAudio();
    };
  }, [audioSrc, enabled, hasUserInteracted, isPageVisible, mediaKey, shouldMute, shouldPlay, videoRef]);
};
