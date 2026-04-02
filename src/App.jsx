import React, { useState, useEffect, useRef } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import IntroVideoPage from './pages/IntroVideoPage';
import LanguagePage from './pages/LanguagePage';
import FormPage from './pages/FormPage';
import InstructionPage from './pages/InstructionPage';
import ChallengeIntroPage from './pages/ChallengeIntroPage';
import ChallengePage from './pages/ChallengePage';
import TransitionVideoPage from './pages/TransitionVideoPage';
import EndPage from './pages/EndPage';
import FinalAnimationPage from './pages/FinalAnimationPage';
import { APP_AUDIO, APP_VIDEOS, getIOSVoiceoverSrc, getPreferredVideoSrc, LEVEL_TRANSITION_VIDEOS, PRELOAD_IMAGES, PRELOAD_IOS_AUDIO, PRELOAD_IOS_VIDEOS, PRELOAD_VIDEOS } from './config/media';
import { preloadAudio, preloadMediaBundle, preloadVideo } from './utils/preloadMedia';

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzk7doqCW5yl04o4cZ_rDyGNFvFIlI5RUOSgZo-2CD0P-LMhBEpdf7UFbFML13F4mu-2A/exec';
const NORMAL_FRAME_9_VIDEO = APP_VIDEOS.transitionQ5;
const PREVIOUS_TRANSITION_CONFIG = {
  0: { page: 'challengeIntroPage', startTime: 7.2 },
  1: { videoSrc: APP_VIDEOS.transitionQ2, level: 0, startTime: 4 },
  2: { videoSrc: APP_VIDEOS.transitionQ3, level: 1, startTime: 7.5 },
  3: { videoSrc: APP_VIDEOS.transitionQ4, level: 2, startTime: 5 },
};

function AppContent() {
  const { t, isIOSLikeDevice } = useLanguage();

  const [page, setPage] = useState('introVideo');
  const [currentUser, setCurrentUser] = useState({ name: '', phone: '', district: '', state: '' });
  const [currentLevel, setCurrentLevel] = useState(0);
  const [happinessScore, setHappinessScore] = useState(50);
  const [bubbleTrail, setBubbleTrail] = useState([]);
  const [transitionVideoSrc, setTransitionVideoSrc] = useState('');
  const [videoNavigationMode, setVideoNavigationMode] = useState('flow');
  const [challengeIntroStartTime, setChallengeIntroStartTime] = useState(0);
  const [transitionVideoStartTime, setTransitionVideoStartTime] = useState(0);
  const levelStartScoresRef = useRef({});

  const submitUserToSheet = (userData, status) => {
    if (typeof document === 'undefined') return;

    const iframeName = 'sheet-submit-frame';
    let iframe = document.querySelector(`iframe[name="${iframeName}"]`);

    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.title = 'sheet submission frame';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = SHEET_URL;
    form.target = iframeName;
    form.style.display = 'none';

    const fields = {
      name: userData.name,
      phone: userData.phone,
      phoneNumber: userData.phone,
      district: userData.district,
      state: userData.state,
      status,
    };

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value ?? '';
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  useEffect(() => {
    const syncViewportHeight = () => {
      const viewportUnit = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--app-vh', `${viewportUnit}px`);
    };

    syncViewportHeight();
    window.addEventListener('resize', syncViewportHeight);
    window.addEventListener('orientationchange', syncViewportHeight);

    return () => {
      window.removeEventListener('resize', syncViewportHeight);
      window.removeEventListener('orientationchange', syncViewportHeight);
    };
  }, []);

  useEffect(() => {
    preloadMediaBundle({
      images: PRELOAD_IMAGES,
      videos: isIOSLikeDevice ? PRELOAD_IOS_VIDEOS : PRELOAD_VIDEOS,
      audio: isIOSLikeDevice ? [APP_AUDIO.music, ...PRELOAD_IOS_AUDIO] : [APP_AUDIO.music],
    });
  }, [isIOSLikeDevice]);

  useEffect(() => {
    const upcomingVideoSources = [];

    if (page === 'challengeIntroPage' || page === 'challengePage') {
      upcomingVideoSources.push(LEVEL_TRANSITION_VIDEOS[currentLevel]);
      if (currentLevel + 1 >= t.levels.length) {
        upcomingVideoSources.push(APP_VIDEOS.finalTransition);
      }
    }

    if (page === 'transitionVideo' || page === 'finalTransitionVideo') {
      if (currentLevel + 2 >= t.levels.length) {
        upcomingVideoSources.push(APP_VIDEOS.finalTransition, APP_VIDEOS.postAnimationTransition);
      }
    }

    if (page === 'finalTransitionVideo') {
      upcomingVideoSources.push(NORMAL_FRAME_9_VIDEO);
    }

    if (page === 'finalAnimationPage') {
      upcomingVideoSources.push(APP_VIDEOS.postAnimationTransition, APP_VIDEOS.end);
    }

    upcomingVideoSources
      .filter(Boolean)
      .map((src) => getPreferredVideoSrc(src, isIOSLikeDevice))
      .forEach(preloadVideo);

    if (isIOSLikeDevice) {
      upcomingVideoSources
        .map(getIOSVoiceoverSrc)
        .filter(Boolean)
        .forEach(preloadAudio);
    }
  }, [currentLevel, isIOSLikeDevice, page, t.levels.length]);

  const handleIntroVideoComplete = () => {
    setPage('languagePage');
  };

  const handleLanguageComplete = () => {
    setPage('instructionPage');
  };

  const handleInstructionNext = () => {
    setPage('formPage');
  };

  const handleFormSubmit = (userData) => {
    setCurrentUser(userData);
    submitUserToSheet(userData, 'lose');

    startGame();
  };

  const startGame = () => {
    setCurrentLevel(0);
    setBubbleTrail([]);
    setHappinessScore(50);
    levelStartScoresRef.current = {};
    setChallengeIntroStartTime(0);
    setPage('challengeIntroPage');
  };

  const handleIntroComplete = () => {
    setVideoNavigationMode('flow');
    setChallengeIntroStartTime(0);
    setPage('challengePage');
  };

  const handleChallengeIntroPrevious = () => {
    setPage('formPage');
  };

  const goToTransitionVideoAt = (videoIndex) => {
    const targetVideoSrc = LEVEL_TRANSITION_VIDEOS[videoIndex];
    if (!targetVideoSrc) return false;

    setCurrentLevel(videoIndex);
    setTransitionVideoSrc(targetVideoSrc);
    setTransitionVideoStartTime(0);
    setVideoNavigationMode('browse');
    setPage('transitionVideo');
    return true;
  };

  const rewindProgressToLevel = (targetLevel) => {
    const normalizedLevel = Math.max(targetLevel, 0);
    const restoredScore = levelStartScoresRef.current[normalizedLevel] ?? 50;

    setBubbleTrail((prev) => prev.map((item, index) => (index < normalizedLevel ? item : null)));

    Object.keys(levelStartScoresRef.current).forEach((levelKey) => {
      if (Number(levelKey) >= normalizedLevel) {
        delete levelStartScoresRef.current[levelKey];
      }
    });

    setHappinessScore(restoredScore);
  };

  const handlePreviousVideo = () => {
    rewindProgressToLevel(currentLevel);

    if (page === 'transitionVideo') {
      const currentVideoIndex = LEVEL_TRANSITION_VIDEOS.indexOf(transitionVideoSrc);
      const previousConfig = PREVIOUS_TRANSITION_CONFIG[currentVideoIndex];

      if (previousConfig?.page === 'challengeIntroPage') {
        setChallengeIntroStartTime(previousConfig.startTime);
        setVideoNavigationMode('rewind');
        setPage('challengeIntroPage');
        return;
      }

      if (previousConfig?.videoSrc) {
        setCurrentLevel(previousConfig.level);
        setTransitionVideoSrc(previousConfig.videoSrc);
        setTransitionVideoStartTime(previousConfig.startTime);
        setVideoNavigationMode('rewind');
        setPage('transitionVideo');
        return;
      }

      setCurrentLevel(0);
      setVideoNavigationMode('flow');
      setPage('challengeIntroPage');
      return;
    }

    if (page === 'finalTransitionVideo') {
      setCurrentLevel(3);
      setTransitionVideoSrc(NORMAL_FRAME_9_VIDEO);
      setTransitionVideoStartTime(4);
      setVideoNavigationMode('rewind');
      setPage('transitionVideo');
      return;
    }

    if (page === 'postAnimationTransitionVideo') {
      setTransitionVideoSrc(APP_VIDEOS.finalTransition);
      setVideoNavigationMode('browse');
      setPage('finalTransitionVideo');
    }
  };

  const handleNextVideo = () => {
    if (page === 'transitionVideo') {
      setVideoNavigationMode('flow');
      setCurrentLevel((prev) => prev + 1);
      setPage('challengePage');
      return;
    }

    if (page === 'finalTransitionVideo') {
      setVideoNavigationMode('flow');
      setPage('finalAnimationPage');
      return;
    }

    if (page === 'postAnimationTransitionVideo') {
      setVideoNavigationMode('flow');
      handleGameComplete();
    }
  };

  const handleRestartGame = () => {
    setPage('introVideo');
    setCurrentUser({ name: '', phone: '', district: '', state: '' });
    setCurrentLevel(0);
    setHappinessScore(50);
    setBubbleTrail([]);
    levelStartScoresRef.current = {};
    setTransitionVideoSrc('');
    setTransitionVideoStartTime(0);
    setVideoNavigationMode('flow');
    setChallengeIntroStartTime(0);
  };

  useEffect(() => {
    if (page !== 'challengePage') return;

    if (levelStartScoresRef.current[currentLevel] === undefined) {
      levelStartScoresRef.current[currentLevel] = happinessScore;
    }
  }, [page, currentLevel, happinessScore]);

  const handleWrongAnswer = () => {
    setHappinessScore((prev) => Math.max(prev - 10, 0));
  };

  const handleCorrectAnswer = () => {
    // Score and delay are handled in ChallengePage for immediate feedback.
  };

  const handleLevelComplete = () => {
    if (currentLevel + 1 >= t.levels.length) {
      setTransitionVideoSrc(APP_VIDEOS.finalTransition);
      setTransitionVideoStartTime(0);
      setVideoNavigationMode('flow');
      setPage('finalTransitionVideo');
      return;
    }

    const videoSrc = currentLevel === 3 ? NORMAL_FRAME_9_VIDEO : LEVEL_TRANSITION_VIDEOS[currentLevel];
    if (videoSrc) {
      setTransitionVideoSrc(videoSrc);
      setTransitionVideoStartTime(0);
      setVideoNavigationMode('flow');
      setPage('transitionVideo');
      return;
    }

    setCurrentLevel((prev) => prev + 1);
  };

  const handlePreviousQuestion = () => {
    if (page === 'transitionVideo' || page === 'finalTransitionVideo' || page === 'postAnimationTransitionVideo') {
      rewindProgressToLevel(currentLevel);
      setPage('challengePage');
      return;
    }

    if (page === 'challengePage' && currentLevel > 0) {
      const previousLevel = Math.max(currentLevel - 1, 0);
      rewindProgressToLevel(previousLevel);
      setCurrentLevel(previousLevel);
      setPage('challengePage');
    }
  };

  const handleSkipVideo = () => {
    if (currentLevel + 1 >= t.levels.length) {
      setPage('finalAnimationPage');
      return;
    }

    setCurrentLevel((prev) => prev + 1);
    setPage('challengePage');
  };

  const handleTransitionVideoComplete = () => {
    if (videoNavigationMode === 'browse') {
      return;
    }

    setTransitionVideoStartTime(0);
    setVideoNavigationMode('flow');
    setCurrentLevel((prev) => prev + 1);
    setPage('challengePage');
  };

  const handleFinalTransitionVideoComplete = () => {
    if (videoNavigationMode === 'browse') {
      return;
    }

    setTransitionVideoStartTime(0);
    setPage('finalAnimationPage');
  };

  const handleFinalAnimationComplete = () => {
    setTransitionVideoSrc(APP_VIDEOS.postAnimationTransition);
    setTransitionVideoStartTime(0);
    setVideoNavigationMode('flow');
    setPage('postAnimationTransitionVideo');
  };

  const handlePostAnimationVideoComplete = () => {
    if (videoNavigationMode === 'browse') {
      return;
    }

    handleGameComplete();
  };

  const handleGameComplete = () => {
    setPage('endPage');
  };

  const renderPage = () => {
    switch (page) {
      case 'introVideo':
        return <IntroVideoPage onComplete={handleIntroVideoComplete} />;
      case 'languagePage':
        return <LanguagePage onComplete={handleLanguageComplete} />;
      case 'instructionPage':
        return <InstructionPage onStart={handleInstructionNext} />;
      case 'formPage':
        return <FormPage onSubmit={handleFormSubmit} />;
      case 'challengeIntroPage':
        return (
          <ChallengeIntroPage
            currentLevel={currentLevel}
            happinessScore={happinessScore}
            initialSeekTime={challengeIntroStartTime}
            navigationMode={videoNavigationMode}
            onStart={handleIntroComplete}
            onPrevious={handleChallengeIntroPrevious}
            onRestartGame={handleRestartGame}
          />
        );
      case 'challengePage':
        return (
          <ChallengePage
            currentLevel={currentLevel}
            happinessScore={happinessScore}
            setHappinessScore={setHappinessScore}
            onWrongAnswer={handleWrongAnswer}
            onCorrectAnswer={handleCorrectAnswer}
            onLevelComplete={handleLevelComplete}
            onGameComplete={handleGameComplete}
            onSkipVideo={handleSkipVideo}
            onPreviousQuestion={handlePreviousQuestion}
            onNextQuestion={handleLevelComplete}
            onRestartGame={handleRestartGame}
            bubbleTrail={bubbleTrail}
            setBubbleTrail={setBubbleTrail}
          />
        );
      case 'transitionVideo':
        return (
          <TransitionVideoPage
            videoSrc={transitionVideoSrc}
            initialSeekTime={transitionVideoStartTime}
            onComplete={handleTransitionVideoComplete}
            onSkipVideo={handleSkipVideo}
            onPreviousQuestion={handlePreviousVideo}
            onNextQuestion={handleNextVideo}
            bubbleTrail={bubbleTrail}
            happinessScore={happinessScore}
            showControls
            onRestartGame={handleRestartGame}
          />
        );
      case 'finalTransitionVideo':
        return (
          <TransitionVideoPage
            videoSrc={transitionVideoSrc}
            initialSeekTime={transitionVideoStartTime}
            onComplete={handleFinalTransitionVideoComplete}
            onSkipVideo={handleSkipVideo}
            onPreviousQuestion={handlePreviousVideo}
            onNextQuestion={handleNextVideo}
            bubbleTrail={bubbleTrail}
            happinessScore={happinessScore}
            showControls
            onRestartGame={handleRestartGame}
          />
        );
      case 'finalAnimationPage':
        return <FinalAnimationPage onComplete={handleFinalAnimationComplete} />;
      case 'postAnimationTransitionVideo':
        return (
          <TransitionVideoPage
            videoSrc={transitionVideoSrc}
            initialSeekTime={transitionVideoStartTime}
            onComplete={handlePostAnimationVideoComplete}
            onPreviousQuestion={handlePreviousVideo}
            onNextQuestion={handleNextVideo}
            showArrows={false}
          />
        );
      case 'endPage':
        return <EndPage onProceed={() => { window.location.href = 'https://wa.me/9182879315'; }} />;
      default:
        return null;
    }
  };

  return renderPage();
}

function App() {
  const audioRef = useRef(null);
  const { shouldMuteAll, isGamePaused, hasUserInteracted } = useLanguage();

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return undefined;

    audioElement.volume = 0.1;
    audioElement.preload = 'auto';
    audioElement.loop = true;
    audioElement.muted = shouldMuteAll;

    const tryStartAudio = () => {
      if (!audioRef.current || shouldMuteAll || isGamePaused || !hasUserInteracted) return;
      if (!audioRef.current.paused) return;

      audioRef.current.play().catch(() => {});
    };

    audioElement.load();
    tryStartAudio();

    const startupEvents = ['click', 'keydown', 'touchstart', 'pointerdown', 'focus'];
    startupEvents.forEach((eventName) => {
      window.addEventListener(eventName, tryStartAudio);
    });
    audioElement.addEventListener('canplay', tryStartAudio);
    audioElement.addEventListener('canplaythrough', tryStartAudio);
    audioElement.addEventListener('loadeddata', tryStartAudio);
    audioElement.addEventListener('pause', tryStartAudio);
    audioElement.addEventListener('ended', tryStartAudio);
    audioElement.addEventListener('stalled', tryStartAudio);
    audioElement.addEventListener('suspend', tryStartAudio);
    audioElement.addEventListener('waiting', tryStartAudio);

    return () => {
      startupEvents.forEach((eventName) => {
        window.removeEventListener(eventName, tryStartAudio);
      });
      audioElement.removeEventListener('canplay', tryStartAudio);
      audioElement.removeEventListener('canplaythrough', tryStartAudio);
      audioElement.removeEventListener('loadeddata', tryStartAudio);
      audioElement.removeEventListener('pause', tryStartAudio);
      audioElement.removeEventListener('ended', tryStartAudio);
      audioElement.removeEventListener('stalled', tryStartAudio);
      audioElement.removeEventListener('suspend', tryStartAudio);
      audioElement.removeEventListener('waiting', tryStartAudio);
    };
  }, [shouldMuteAll, isGamePaused, hasUserInteracted]);

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.muted = shouldMuteAll;

    if (shouldMuteAll || isGamePaused || !hasUserInteracted) {
      audioRef.current.pause();
      return;
    }

    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
  }, [shouldMuteAll, isGamePaused, hasUserInteracted]);

  return (
    <>
      <AppContent />
      <audio ref={audioRef} src={APP_AUDIO.music} loop autoPlay preload="auto" />
    </>
  );
}

function AppWithProviders() {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}

export default AppWithProviders;
