import React, { useEffect, useState } from 'react';
import './FinalAnimationPage.css';
import './ChallengePage.css';
import { APP_IMAGES, APP_VIDEOS } from '../config/media';
import ScreenLoadingOverlay from '../components/ScreenLoadingOverlay';
import { useScreenMediaReady } from '../hooks/useScreenMediaReady';

const FinalAnimationPage = ({ onComplete }) => {
  const backgroundSrc = 'https://res.cloudinary.com/dbyrmzuuw/image/upload/v1773987192/Frame_10_end_nmhghb.png';
  const [shouldProceed, setShouldProceed] = useState(false);
  const { isReady } = useScreenMediaReady([
    { id: 'post-animation-transition', type: 'video', src: APP_VIDEOS.postAnimationTransition },
    { id: 'end-video', type: 'video', src: APP_VIDEOS.end },
  ]);

  useEffect(() => {
    if (shouldProceed && isReady) {
      onComplete();
    }
  }, [isReady, onComplete, shouldProceed]);

  const handleProceed = () => {
    if (shouldProceed) return;
    setShouldProceed(true);
  };

  return (
    <div className="page active final-animation-container">
      <img
        src={backgroundSrc}
        alt="background"
        className="fluid-bg"
        loading="eager"
        decoding="async"
      />


      <div className="logo-container">
        <div className="rotating-glow-final">
          <img
            src={APP_IMAGES.glow}
            alt="Glow effect"
            className="rotating-glow-final-image"
            loading="eager"
            decoding="async"
          />
        </div>
        <button type="button" className="jumbo-super-logo-button" onClick={handleProceed}>
          <img
            src={APP_IMAGES.logo}
            alt="Jumbo Super Logo"
            className="jumbo-super-logo"
            loading="eager"
            decoding="async"
          />
        </button>
      </div>
      <ScreenLoadingOverlay visible={shouldProceed && !isReady} />
    </div>
  );
};

export default FinalAnimationPage;
