/**
 * LoadingOverlayコンポーネントのテスト
 * TDD RED: まずテストを作成し、失敗することを確認する
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingOverlay } from '../../../src/content/components/LoadingOverlay';

describe('LoadingOverlay', () => {
  describe('visibility', () => {
    it('should not render when isVisible is false', () => {
      render(<LoadingOverlay isVisible={false} />);
      expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
    });

    it('should render when isVisible is true', () => {
      render(<LoadingOverlay isVisible={true} />);
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });
  });

  describe('message', () => {
    it('should show default message when not provided', () => {
      render(<LoadingOverlay isVisible={true} />);
      expect(screen.getByText('処理中...')).toBeInTheDocument();
    });

    it('should show custom message when provided', () => {
      render(<LoadingOverlay isVisible={true} message="本文を抽出中..." />);
      expect(screen.getByText('本文を抽出中...')).toBeInTheDocument();
    });

    it('should show different messages for different operations', () => {
      const { rerender } = render(<LoadingOverlay isVisible={true} message="要約中..." />);
      expect(screen.getByText('要約中...')).toBeInTheDocument();

      rerender(<LoadingOverlay isVisible={true} message="本文を抽出中..." />);
      expect(screen.getByText('本文を抽出中...')).toBeInTheDocument();
    });
  });

  describe('spinner', () => {
    it('should display spinner element', () => {
      render(<LoadingOverlay isVisible={true} />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });
});
