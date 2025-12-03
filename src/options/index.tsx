/**
 * 設定画面コンポーネント
 * feynman-techniqueから移植・簡略化
 */
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { browserAdapter } from '@shared/adapters/BrowserAdapter';
import type { AISettings } from '@shared/types';

interface SettingsState extends AISettings {
  // AISettingsを拡張
}

export const OptionsApp: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    openrouterApiKey: '',
    openRouterModel: '',
    openRouterProvider: '',
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // メッセージを表示するヘルパー
  const showMessage = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // 設定を読み込む
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await browserAdapter.storage.local.get([
          'openrouterApiKey',
          'openRouterModel',
          'openRouterProvider',
        ]);

        setSettings({
          openrouterApiKey: (data.openrouterApiKey as string) || '',
          openRouterModel: (data.openRouterModel as string) || '',
          openRouterProvider: (data.openRouterProvider as string) || '',
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // 設定を保存
  const handleSave = async () => {
    try {
      // バリデーション
      if (!settings.openrouterApiKey || settings.openrouterApiKey.trim() === '') {
        showMessage('error', 'API Keyは必須です');
        return;
      }

      if (!settings.openRouterModel || settings.openRouterModel.trim() === '') {
        showMessage('error', 'モデル名は必須です');
        return;
      }

      setIsSaving(true);

      await browserAdapter.storage.local.set({
        openrouterApiKey: settings.openrouterApiKey.trim(),
        openRouterModel: settings.openRouterModel.trim(),
        openRouterProvider: settings.openRouterProvider?.trim() || '',
      });

      showMessage('success', '設定を保存しました');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showMessage('error', '設定の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>
        Spritz Speed Reader - 設定
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        AI機能を使用するための設定を行います
      </p>

      {/* API設定セクション */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
          API 設定
        </h2>

        {/* API Key */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="api-key" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            OpenRouter API Key <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="api-key"
              type={showApiKey ? 'text' : 'password'}
              value={settings.openrouterApiKey}
              onChange={(e) => setSettings({ ...settings, openrouterApiKey: e.target.value })}
              placeholder="sk-or-v1-..."
              style={{
                width: '100%',
                padding: '10px 80px 10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '4px 12px',
                fontSize: '13px',
                color: '#2563eb',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* モデル名 */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="model" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            モデル名 <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            id="model"
            type="text"
            value={settings.openRouterModel}
            onChange={(e) => setSettings({ ...settings, openRouterModel: e.target.value })}
            placeholder="google/gemini-2.0-flash-exp:free"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          <p style={{ marginTop: '6px', fontSize: '13px', color: '#6b7280' }}>
            例: google/gemini-2.0-flash-exp:free, anthropic/claude-3-haiku
          </p>
        </div>

        {/* プロバイダ */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="provider" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            プロバイダ指定（オプション）
          </label>
          <input
            id="provider"
            type="text"
            value={settings.openRouterProvider || ''}
            onChange={(e) => setSettings({ ...settings, openRouterProvider: e.target.value })}
            placeholder="例: Google, DeepInfra, Together"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          <p style={{ marginTop: '6px', fontSize: '13px', color: '#6b7280' }}>
            特定のプロバイダを優先したい場合に指定してください。空欄の場合は自動選択されます。
          </p>
        </div>

        {/* セキュリティ通知 */}
        <div style={{
          padding: '16px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          marginTop: '20px',
        }}>
          <p style={{ fontSize: '13px', color: '#1e40af', margin: 0 }}>
            <strong>セキュリティ通知:</strong> API Keyはブラウザのローカルストレージに保存され、
            OpenRouter API へのリクエストにのみ使用されます。第三者と共有されることはありません。
          </p>
        </div>
      </section>

      {/* 保存ボタン */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '10px 24px',
            backgroundColor: isSaving ? '#9ca3af' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? '保存中...' : '設定を保存'}
        </button>

        {saveMessage && (
          <span style={{
            fontSize: '14px',
            color: saveMessage.type === 'success' ? '#059669' : '#dc2626',
            fontWeight: '500',
          }}>
            {saveMessage.text}
          </span>
        )}
      </div>
    </div>
  );
};

// DOMにマウント
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<OptionsApp />);
}
