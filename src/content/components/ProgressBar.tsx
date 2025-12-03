interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps): JSX.Element {
  return (
    <div
      data-testid="progress-bar"
      style={{
        width: '80%',
        maxWidth: '600px',
        height: '10px',
        backgroundColor: '#333',
        borderRadius: '5px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          backgroundColor: '#007bff',
          width: `${progress}%`,
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  );
}
