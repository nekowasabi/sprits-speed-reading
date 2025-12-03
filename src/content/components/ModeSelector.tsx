/**
 * ModeSelectorコンポーネント
 * 読み取りモード（original/extracted/summary）を選択するためのラジオボタンUI
 */
import React from 'react';
import { ReadingMode } from '../../shared/types';

export interface ModeSelectorProps {
  currentMode: ReadingMode;
  onModeChange: (mode: ReadingMode) => void;
  isProcessing: boolean;
  hasApiKey: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
  isProcessing,
  hasApiKey,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onModeChange(event.target.value as ReadingMode);
  };

  // AI機能を使用するモードかどうか判定
  const isAiMode = (mode: ReadingMode): boolean => {
    return mode === 'extracted' || mode === 'summary';
  };

  // 各モードの有効/無効状態を判定
  const isDisabled = (mode: ReadingMode): boolean => {
    if (isProcessing) return true;
    if (isAiMode(mode) && !hasApiKey) return true;
    return false;
  };

  return (
    <div data-testid="mode-selector" style={{ marginBottom: '10px' }}>
      <div style={{ marginBottom: '5px' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <input
            type="radio"
            name="reading-mode"
            value="original"
            checked={currentMode === 'original'}
            onChange={handleChange}
            disabled={isDisabled('original')}
            style={{ marginRight: '5px' }}
          />
          元のテキスト
        </label>

        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <input
            type="radio"
            name="reading-mode"
            value="extracted"
            checked={currentMode === 'extracted'}
            onChange={handleChange}
            disabled={isDisabled('extracted')}
            style={{ marginRight: '5px' }}
          />
          本文抽出
        </label>

        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <input
            type="radio"
            name="reading-mode"
            value="summary"
            checked={currentMode === 'summary'}
            onChange={handleChange}
            disabled={isDisabled('summary')}
            style={{ marginRight: '5px' }}
          />
          要約
        </label>
      </div>

      {!hasApiKey && (
        <div
          style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '5px',
          }}
        >
          APIキーが設定されていません。AI機能を使用するには設定画面でAPIキーを入力してください。
        </div>
      )}
    </div>
  );
};
