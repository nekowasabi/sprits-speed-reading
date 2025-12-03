/**
 * 設定画面コンポーネントのテスト
 * TDD RED: まずテストを作成し、失敗することを確認する
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OptionsApp } from '../../src/options/index';

// browserAdapterのモック
const mockStorageGet = jest.fn();
const mockStorageSet = jest.fn();

jest.mock('@shared/adapters/BrowserAdapter', () => ({
  browserAdapter: {
    storage: {
      local: {
        get: (...args: unknown[]) => mockStorageGet(...args),
        set: (...args: unknown[]) => mockStorageSet(...args),
      },
    },
  },
}));

describe('OptionsApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageGet.mockResolvedValue({});
    mockStorageSet.mockResolvedValue(undefined);
  });

  describe('rendering', () => {
    it('should render settings form', async () => {
      render(<OptionsApp />);

      await waitFor(() => {
        expect(screen.getByText('Spritz Speed Reader - 設定')).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/OpenRouter API Key/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/モデル名/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/プロバイダ指定/i)).toBeInTheDocument();
    });

    it('should load saved settings on mount', async () => {
      mockStorageGet.mockResolvedValueOnce({
        openrouterApiKey: 'saved-api-key',
        openRouterModel: 'saved-model',
        openRouterProvider: 'saved-provider',
      });

      render(<OptionsApp />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('saved-api-key')).toBeInTheDocument();
        expect(screen.getByDisplayValue('saved-model')).toBeInTheDocument();
        expect(screen.getByDisplayValue('saved-provider')).toBeInTheDocument();
      });
    });
  });

  describe('API Key input', () => {
    it('should toggle API key visibility', async () => {
      render(<OptionsApp />);

      await waitFor(() => {
        expect(screen.getByLabelText(/OpenRouter API Key/i)).toBeInTheDocument();
      });

      const apiKeyInput = screen.getByLabelText(/OpenRouter API Key/i);
      expect(apiKeyInput).toHaveAttribute('type', 'password');

      const toggleButton = screen.getByText('Show');
      fireEvent.click(toggleButton);

      expect(apiKeyInput).toHaveAttribute('type', 'text');
      expect(screen.getByText('Hide')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should save settings when form is submitted', async () => {
      render(<OptionsApp />);

      await waitFor(() => {
        expect(screen.getByLabelText(/OpenRouter API Key/i)).toBeInTheDocument();
      });

      const apiKeyInput = screen.getByLabelText(/OpenRouter API Key/i);
      const modelInput = screen.getByLabelText(/モデル名/i);

      fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });
      fireEvent.change(modelInput, { target: { value: 'test-model' } });

      const saveButton = screen.getByText('設定を保存');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockStorageSet).toHaveBeenCalledWith(
          expect.objectContaining({
            openrouterApiKey: 'test-api-key',
            openRouterModel: 'test-model',
          })
        );
      });
    });

    it('should show error when API key is empty', async () => {
      render(<OptionsApp />);

      await waitFor(() => {
        expect(screen.getByLabelText(/OpenRouter API Key/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByText('設定を保存');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/API Keyは必須です/i)).toBeInTheDocument();
      });
    });

    it('should show error when model name is empty', async () => {
      render(<OptionsApp />);

      await waitFor(() => {
        expect(screen.getByLabelText(/OpenRouter API Key/i)).toBeInTheDocument();
      });

      const apiKeyInput = screen.getByLabelText(/OpenRouter API Key/i);
      fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });

      const saveButton = screen.getByText('設定を保存');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/モデル名は必須です/i)).toBeInTheDocument();
      });
    });

    it('should show success message after saving', async () => {
      render(<OptionsApp />);

      await waitFor(() => {
        expect(screen.getByLabelText(/OpenRouter API Key/i)).toBeInTheDocument();
      });

      const apiKeyInput = screen.getByLabelText(/OpenRouter API Key/i);
      const modelInput = screen.getByLabelText(/モデル名/i);

      fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });
      fireEvent.change(modelInput, { target: { value: 'test-model' } });

      const saveButton = screen.getByText('設定を保存');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/設定を保存しました/i)).toBeInTheDocument();
      });
    });
  });

  describe('provider field', () => {
    it('should allow empty provider', async () => {
      render(<OptionsApp />);

      await waitFor(() => {
        expect(screen.getByLabelText(/OpenRouter API Key/i)).toBeInTheDocument();
      });

      const apiKeyInput = screen.getByLabelText(/OpenRouter API Key/i);
      const modelInput = screen.getByLabelText(/モデル名/i);
      const providerInput = screen.getByLabelText(/プロバイダ指定/i);

      fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });
      fireEvent.change(modelInput, { target: { value: 'test-model' } });
      fireEvent.change(providerInput, { target: { value: '' } });

      const saveButton = screen.getByText('設定を保存');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockStorageSet).toHaveBeenCalledWith(
          expect.objectContaining({
            openRouterProvider: '',
          })
        );
      });
    });
  });
});
