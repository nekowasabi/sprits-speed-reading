/**
 * ローディングオーバーレイコンポーネント
 * AI処理中に表示するスピナーとメッセージ
 */

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = '処理中...' }: LoadingOverlayProps): JSX.Element | null {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      data-testid="loading-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: '8px',
      }}
    >
      {/* スピナー */}
      <div
        data-testid="loading-spinner"
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid #fff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px',
        }}
      />

      {/* メッセージ */}
      <p
        style={{
          color: '#fff',
          fontSize: '16px',
          fontWeight: '500',
          margin: 0,
        }}
      >
        {message}
      </p>

      {/* スピナーアニメーション用のスタイル */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
