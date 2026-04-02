import React, { createContext, useEffect, useState, useContext } from 'react';
import hi from '../locales/hi';
import pa from '../locales/pa';
import { primeIOSVoiceoverPlayer } from '../utils/iosVoiceoverPlayer';

const translations = {
  hi,
  pa
};

const LanguageContext = createContext();

const detectIOSLikeDevice = () => {
  if (typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  return /iPad|iPhone|iPod/i.test(userAgent)
    || (platform === 'MacIntel' && maxTouchPoints > 1);
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('hi');
  const [isMuted, setIsMuted] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isIOSLikeDevice] = useState(detectIOSLikeDevice);
  const [isPageVisible, setIsPageVisible] = useState(() => (
    typeof document === 'undefined' ? true : !document.hidden
  ));

  const t = translations[lang];
  const shouldMuteAll = isMuted || !isPageVisible;

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    handleVisibilityChange();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const markInteracted = () => {
      setHasUserInteracted(true);
      if (detectIOSLikeDevice()) {
        primeIOSVoiceoverPlayer().catch(() => {});
      }
    };

    const interactionEvents = ['pointerdown', 'touchstart', 'click', 'keydown'];
    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, markInteracted, { once: true, passive: true });
    });

    return () => {
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, markInteracted);
      });
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-lang', lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isMuted, setIsMuted, isPageVisible, shouldMuteAll, isGamePaused, setIsGamePaused, hasUserInteracted, isIOSLikeDevice }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
