import { extractCleanText } from './htmlCleaner';

/**
 * Extract readable text from the page.
 *
 * @returns Array of words from the page content
 */
export function extractWords(): string[] {
  const text = document.body.innerText || '';
  return text.split(/\s+/).filter((word) => word.length > 0);
}

/**
 * 不要要素を除去したクリーンなテキストを単語配列として抽出する
 *
 * ナビゲーション、広告、サイドバー等を除去した本文のみを返す。
 * AI処理前の前処理として使用することで、送信テキスト量を削減できる。
 *
 * @returns クリーンな本文から抽出した単語配列
 */
export function extractCleanWords(): string[] {
  const text = extractCleanText();
  return text.split(/\s+/).filter((word) => word.length > 0);
}

/**
 * 不要要素を除去したクリーンなテキストを文字列として取得する
 *
 * @returns クリーンな本文テキスト
 */
export function getCleanPageText(): string {
  return extractCleanText();
}

/**
 * Extract text from a specific element.
 *
 * @param element - The DOM element to extract text from
 * @returns Array of words from the element
 */
export function extractWordsFromElement(element: HTMLElement): string[] {
  const text = element.innerText || '';
  return text.split(/\s+/).filter((word) => word.length > 0);
}

/**
 * Extract selected text from the page.
 *
 * @returns Array of words from the current selection, or null if nothing is selected
 */
export function extractSelectedWords(): string[] | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    return null;
  }

  const text = selection.toString();
  const words = text.split(/\s+/).filter((word) => word.length > 0);

  return words.length > 0 ? words : null;
}
