import { MIN_WPM, MAX_WPM, WPM_STEP, MIN_MAX_CHARS, MAX_MAX_CHARS } from '@shared/types';

interface ControlsProps {
  wpm: number;
  maxChars: number;
  isPaused: boolean;
  onTogglePlayPause: () => void;
  onWpmChange: (wpm: number) => void;
  onMaxCharsChange: (maxChars: number) => void;
  onClose: () => void;
}

export function Controls({
  wpm,
  maxChars,
  isPaused,
  onTogglePlayPause,
  onWpmChange,
  onMaxCharsChange,
  onClose,
}: ControlsProps): JSX.Element {
  const handleWpmSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onWpmChange(parseInt(e.target.value, 10));
  };

  const handleMaxCharsSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onMaxCharsChange(parseInt(e.target.value, 10));
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    transition: 'background-color 0.2s',
  };

  const closeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#333',
    fontWeight: 'bold',
    minWidth: '80px',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '15px 25px',
        borderRadius: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      <button
        onClick={onTogglePlayPause}
        style={buttonStyle}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
      >
        {isPaused ? '▶️ Play' : '⏸️ Pause'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={labelStyle}>WPM: {wpm}</label>
        <input
          type="range"
          min={MIN_WPM}
          max={MAX_WPM}
          step={WPM_STEP}
          value={wpm}
          onChange={handleWpmSliderChange}
          style={{ width: '120px' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={labelStyle}>Chars: {maxChars}</label>
        <input
          type="range"
          min={MIN_MAX_CHARS}
          max={MAX_MAX_CHARS}
          step={1}
          value={maxChars}
          onChange={handleMaxCharsSliderChange}
          style={{ width: '100px' }}
        />
      </div>

      <button
        onClick={onClose}
        style={closeButtonStyle}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c82333')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc3545')}
      >
        ✕ Close
      </button>
    </div>
  );
}
