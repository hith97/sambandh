import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import HappinessMeter from '../components/HappinessMeter';
import Timer from '../components/Timer';
import SettingsMenu from '../components/SettingsMenu';
import './ChallengePage.css';
import '../components/ScrollUI.css';
import { APP_AUDIO, APP_IMAGES, LEVEL_BACKGROUNDS } from '../config/media';

const timerAudio = (typeof window !== 'undefined' && typeof Audio !== 'undefined') ? new Audio(APP_AUDIO.timer) : null;
const correctAudio = (typeof window !== 'undefined' && typeof Audio !== 'undefined') ? new Audio(APP_AUDIO.correct) : null;
const wrongAudio = (typeof window !== 'undefined' && typeof Audio !== 'undefined') ? new Audio(APP_AUDIO.wrong) : null;

const ChallengePage = ({
  currentLevel,
  happinessScore,
  setHappinessScore,
  onWrongAnswer,
  onCorrectAnswer,
  onLevelComplete,
  onSkipVideo,
  onPreviousQuestion,
  onNextQuestion,
  onRestartGame,
  bubbleTrail,
  setBubbleTrail,
}) => {
  const { t, shouldMuteAll, isMuted, setIsMuted, isPageVisible, setIsGamePaused } = useLanguage();

  const [challengeStage] = useState('action');
  const [timer, setTimer] = useState(10);
  const [isShaking, setIsShaking] = useState(false);
  const [highlightedOption, setHighlightedOption] = useState(null);
  const [showTimeoutOverlay, setShowTimeoutOverlay] = useState(false);
  const [wrongSelectionsThisLevel, setWrongSelectionsThisLevel] = useState([]);
  const [timedOutOption, setTimedOutOption] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const timerIntervalRef = useRef(null);
  const highlightTimeoutRef = useRef(null);
  const timeoutContinueRef = useRef(null);
  const onWrongAnswerRef = useRef(onWrongAnswer);
  const wasAutoPausedRef = useRef(false);
  const highlightRemainingRef = useRef(5000);
  const highlightStartedAtRef = useRef(null);

  const levels = t.levels;
  const gridOptions = t.gridOptions;
  const currentData = levels[currentLevel];

  useEffect(() => {
    onWrongAnswerRef.current = onWrongAnswer;
  }, [onWrongAnswer]);

  useEffect(() => () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    if (timeoutContinueRef.current) clearTimeout(timeoutContinueRef.current);
    [timerAudio, correctAudio, wrongAudio].forEach((audio) => {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  useEffect(() => {
    if (!highlightedOption) {
      highlightRemainingRef.current = 5000;
      highlightStartedAtRef.current = null;
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
      return undefined;
    }

    if (isPaused) {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }

      if (highlightStartedAtRef.current !== null) {
        const elapsed = Date.now() - highlightStartedAtRef.current;
        highlightRemainingRef.current = Math.max(0, highlightRemainingRef.current - elapsed);
        highlightStartedAtRef.current = null;
      }

      return undefined;
    }

    highlightStartedAtRef.current = Date.now();
    highlightTimeoutRef.current = setTimeout(() => {
      highlightTimeoutRef.current = null;
      highlightStartedAtRef.current = null;
      highlightRemainingRef.current = 5000;
      setHighlightedOption(null);
      onLevelComplete();
    }, highlightRemainingRef.current);

    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
    };
  }, [highlightedOption, isPaused, onLevelComplete]);

  useEffect(() => {
    setShowTimeoutOverlay(false);
    setWrongSelectionsThisLevel([]);
    setHighlightedOption(null);
    setTimedOutOption(null);
    setTimer(10);
    setIsPaused(false);
  }, [currentLevel]);

  useEffect(() => {
    if (!isPageVisible) {
      if (!isPaused && !highlightedOption && !showTimeoutOverlay) {
        wasAutoPausedRef.current = true;
        setIsPaused(true);
      }
      return;
    }

    if (wasAutoPausedRef.current) {
      wasAutoPausedRef.current = false;
      setIsPaused(false);
    }
  }, [highlightedOption, isPageVisible, isPaused, showTimeoutOverlay]);

  useEffect(() => {
    [timerAudio, correctAudio, wrongAudio].forEach((audio) => {
      if (!audio) return;
      audio.preload = 'auto';
      audio.muted = shouldMuteAll;
      if (shouldMuteAll) {
        audio.pause();
      }
    });
  }, [shouldMuteAll]);

  useEffect(() => {
    setIsGamePaused(isPaused);

    return () => {
      setIsGamePaused(false);
    };
  }, [isPaused, setIsGamePaused]);

  useEffect(() => {
    if (!showTimeoutOverlay || isPaused) return undefined;

    timeoutContinueRef.current = setTimeout(() => {
      if (timeoutContinueRef.current) {
        clearTimeout(timeoutContinueRef.current);
        timeoutContinueRef.current = null;
      }
      if (timedOutOption) {
        updateBubbleTrailForCurrentLevel({ value: timedOutOption, type: 'timeout' });
      }
      setShowTimeoutOverlay(false);
      setTimedOutOption(null);
      setWrongSelectionsThisLevel([]);
      onLevelComplete();
    }, 3000);

    return () => {
      if (timeoutContinueRef.current) {
        clearTimeout(timeoutContinueRef.current);
        timeoutContinueRef.current = null;
      }
    };
  }, [showTimeoutOverlay, isPaused, timedOutOption, currentLevel, onLevelComplete, setBubbleTrail]);

  useEffect(() => {
    if (challengeStage !== 'action' || highlightedOption || showTimeoutOverlay || isPaused || timer <= 0) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (timerAudio) timerAudio.pause();
      return undefined;
    }

    if (timerAudio) {
      timerAudio.loop = true;
      timerAudio.currentTime = 0;
      if (!shouldMuteAll) {
        const playPromise = timerAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }
    }

    timerIntervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        clearInterval(timerIntervalRef.current);
        if (timerAudio) timerAudio.pause();
        if (wrongAudio && !shouldMuteAll) {
          wrongAudio.currentTime = 0;
          const playPromise = wrongAudio.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        }
        if (currentData) {
          setTimedOutOption(currentData.correct);
          setShowTimeoutOverlay(true);
        }
        onWrongAnswerRef.current?.();
        return 0;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (timerAudio) timerAudio.pause();
    };
  }, [challengeStage, highlightedOption, showTimeoutOverlay, isPaused, timer, shouldMuteAll, currentData]);

  if (!currentData) return null;

  const displayText = challengeStage === 'action' ? currentData.action : currentData.post;
  const currentLevelBubble = bubbleTrail[currentLevel] || null;
  const visibleBubbleTrail = bubbleTrail.filter((item) => {
    if (!item) return false;
    if (item.level === currentLevel) return false;
    return true;
  });

  const updateBubbleTrailForCurrentLevel = (entry) => {
    setBubbleTrail((prev) => {
      const nextTrail = [...prev];
      nextTrail[currentLevel] = { ...entry, level: currentLevel };
      return nextTrail;
    });
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleGoHome = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    if (timeoutContinueRef.current) clearTimeout(timeoutContinueRef.current);
    [timerAudio, correctAudio, wrongAudio].forEach((audio) => {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    });
    setIsPaused(false);
    onRestartGame();
  };

  const handleChoose = (event, value) => {
    event.stopPropagation();
    if (challengeStage !== 'action' || highlightedOption || isPaused || showTimeoutOverlay) return;

    if (value === currentData.correct) {
      if (timerAudio) timerAudio.pause();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setHighlightedOption(value);
      setHappinessScore((prev) => prev + 10);
      onCorrectAnswer(value);

      if (correctAudio && !shouldMuteAll) {
        correctAudio.currentTime = 0;
        const playPromise = correctAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }

      updateBubbleTrailForCurrentLevel({ value, type: 'correct' });
      highlightRemainingRef.current = 5000;
      highlightStartedAtRef.current = null;
      return;
    }

    const nextWrongSelections = [...wrongSelectionsThisLevel, value];
    const hasReachedWrongLimit = nextWrongSelections.length >= 3;

    setIsShaking(true);
    if (wrongAudio && !shouldMuteAll) {
      wrongAudio.currentTime = 0;
      const playPromise = wrongAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
    setTimeout(() => setIsShaking(false), 500);
    setWrongSelectionsThisLevel(nextWrongSelections);
    updateBubbleTrailForCurrentLevel({ value, type: 'wrong' });

    if (hasReachedWrongLimit) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (timerAudio) {
        timerAudio.pause();
        timerAudio.currentTime = 0;
      }
      setHappinessScore(0);
      setTimedOutOption(currentData.correct);
      setShowTimeoutOverlay(true);
      return;
    }

    onWrongAnswer();
  };

  return (
    <div className="page active challenge-page-container">
      <img
        key={`bg-${currentLevel}`}
        src={LEVEL_BACKGROUNDS[currentLevel] || LEVEL_BACKGROUNDS[0]}
        alt="background"
        className="fluid-bg"
        loading="eager"
        decoding="async"
      />

      <div className={`challenge-content-wrapper ${isShaking ? 'shake' : ''}`}>
        <div className="top-hud" onClick={(event) => event.stopPropagation()}>
          <div className="hud-left">
            <SettingsMenu
              isMuted={isMuted}
              isPaused={isPaused}
              onTogglePause={handleTogglePause}
              onToggleMute={handleToggleMute}
              onHome={handleGoHome}
            />
          </div>

          <HappinessMeter score={happinessScore} />

          <div className="hud-right">
            <Timer time={timer} />
          </div>
        </div>

        <div className="action-layer-container">
          {isPaused && (
            <div className="paused-screen-overlay">
              <button type="button" className="paused-screen-resume-btn" onClick={handleTogglePause}>
                <img src={APP_IMAGES.playIcon} alt="resume game" className="paused-screen-icon" />
              </button>
            </div>
          )}

          {!highlightedOption && (
            <div className="interactive-play-area">
              <div className="question-wood-banner">
                <span className="question-text-inner">{displayText}</span>
              </div>

              {challengeStage === 'action' && (
                <div className="options-grid-3x3">
                  {gridOptions.map((letter, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`wood-tile-btn ${letter === currentData.correct ? 'blink-correct-tile' : ''} ${wrongSelectionsThisLevel.includes(letter) ? 'wrong-tile-btn' : ''}`}
                      onClick={(event) => handleChoose(event, letter)}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {highlightedOption && (
            <div className="success-overlay-container">
              <img src={APP_IMAGES.glow} alt="Glow effect" className="rotating-glow" loading="eager" decoding="async" />
              <div className="massive-orb">
                {highlightedOption}
              </div>
            </div>
          )}

          {showTimeoutOverlay && (
            <div className="success-overlay-container timeout-overlay-container">
              <div className="timeout-orb" aria-label="timeout answer">
                {currentData.correct}
              </div>
            </div>
          )}

        </div>

        {(visibleBubbleTrail.length > 0 || timedOutOption || (highlightedOption && currentLevelBubble)) && (
          <div className="collected-bubbles-tray single-bubble-tray">
            {visibleBubbleTrail.map((item, index) => (
              <div key={`${item.type}-${index}`} className={item.type === 'correct' ? 'correct-bubble-indicator' : 'wrong-bubble-indicator'}>
                {item.value}
              </div>
            ))}
            {highlightedOption && currentLevelBubble && (
              <div key={`highlighted-current-${currentLevel}`} className={currentLevelBubble.type === 'correct' ? 'correct-bubble-indicator' : 'wrong-bubble-indicator'}>
                {currentLevelBubble.value}
              </div>
            )}
            {timedOutOption && (
              <div key="timeout-current" className="wrong-bubble-indicator">{timedOutOption}</div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ChallengePage;
