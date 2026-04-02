import { APP_IMAGES } from '../config/media';
import './SettingsMenu.css';

const IconButton = ({ icon, alt, onClick, className = '' }) => (
  <button type="button" className={`settings-action-btn ${className}`.trim()} onClick={onClick}>
    <img src={APP_IMAGES.actionButtonBg} alt="" className="settings-action-bg" />
    <img src={icon} alt={alt} className="settings-action-icon" />
  </button>
);

const SettingsMenu = ({
  isMuted,
  isPaused,
  onTogglePause,
  onToggleMute,
  onHome,
}) => (
  <div className="settings-menu">
    <div className="settings-actions always-open">
      <IconButton icon={APP_IMAGES.soundIcon} alt={isMuted ? 'sound off' : 'sound on'} onClick={onToggleMute} className={isMuted ? 'muted' : ''} />
      <IconButton icon={isPaused ? APP_IMAGES.playIcon : APP_IMAGES.pauseIcon} alt={isPaused ? 'resume game' : 'pause game'} onClick={onTogglePause} />
      <IconButton icon={APP_IMAGES.homeIcon} alt="go home" onClick={onHome} />
    </div>
  </div>
);

export default SettingsMenu;
