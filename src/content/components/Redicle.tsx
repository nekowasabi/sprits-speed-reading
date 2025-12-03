import { splitWordByORP } from '@shared/utils/orpCalculator';

interface RedicleProps {
  word: string;
}

export function Redicle({ word }: RedicleProps): JSX.Element {
  const { before, orp, after } = splitWordByORP(word);

  return (
    <div
      style={{
        fontFamily: "'Courier New', monospace",
        fontSize: '48px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        minHeight: '60px',
        minWidth: '400px',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <span>{before}</span>
      <span style={{ color: '#ff0000' }}>{orp}</span>
      <span>{after}</span>
    </div>
  );
}
