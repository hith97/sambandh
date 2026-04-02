import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import loadingAnimation from '../assets/loadingAnimation.json';
import './ScreenLoadingOverlay.css';

const ScreenLoadingOverlay = ({ visible }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!visible || !containerRef.current) return undefined;

    const animationInstance = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: loadingAnimation,
    });

    return () => {
      animationInstance.destroy();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="screen-loading-overlay" aria-live="polite" aria-busy="true">
      <div className="screen-loading-lottie-wrap">
        <div ref={containerRef} className="screen-loading-lottie" />
      </div>
    </div>
  );
};

export default ScreenLoadingOverlay;
