/**
 * HTMLクリーナー
 *
 * Webページから不要な要素（ナビゲーション、広告、サイドバー等）を除去し、
 * 本文コンテンツのみを抽出するためのユーティリティ。
 * LLMへ送信するテキスト量を削減し、処理時間を短縮する。
 */

/**
 * 除去対象のCSSセレクタ一覧
 * これらの要素は本文抽出時に除外される
 */
export const REMOVABLE_SELECTORS: readonly string[] = [
  // ナビゲーション・構造要素
  'nav',
  'header',
  'footer',
  'aside',
  '[role="navigation"]',
  '[role="banner"]',
  '[role="contentinfo"]',
  '[role="complementary"]',

  // 広告関連
  '[class*="ad-"]',
  '[class*="ads-"]',
  '[class*="advertisement"]',
  '[id*="ad-"]',
  '[id*="ads-"]',
  '[class*="banner"]',
  '[class*="sponsor"]',
  '[data-ad]',

  // ソーシャル・シェア
  '[class*="share"]',
  '[class*="social"]',
  '[class*="follow"]',

  // コメントセクション
  '[class*="comment"]',
  '#comments',
  '.comments',

  // サイドバー
  '[class*="sidebar"]',
  '.sidebar',
  '#sidebar',

  // 関連コンテンツ・レコメンド
  '[class*="related"]',
  '[class*="recommend"]',

  // ニュースレター・購読
  '[class*="newsletter"]',
  '[class*="subscribe"]',

  // ポップアップ・モーダル・クッキー通知
  '.popup',
  '.modal',
  '[class*="cookie"]',
] as const;

/**
 * HTMLElementから不要な要素を除去したクローンを作成する
 *
 * 元のDOMは変更せず、クローンに対して操作を行う。
 * 除去対象のセレクタに一致する要素を全て削除する。
 *
 * @param element - クリーニング対象のHTML要素（通常はdocument.body）
 * @returns 不要要素を除去したHTML要素のクローン
 */
export function cleanHtmlContent(element: HTMLElement): HTMLElement {
  // 元のDOMを変更しないようクローンを作成
  const clone = element.cloneNode(true) as HTMLElement;

  // 除去対象セレクタにマッチする要素を全て削除
  REMOVABLE_SELECTORS.forEach((selector) => {
    try {
      const elements = clone.querySelectorAll(selector);
      elements.forEach((el) => el.remove());
    } catch {
      // 不正なセレクタの場合はスキップ（開発時のデバッグ用）
      console.warn(`Invalid selector skipped: ${selector}`);
    }
  });

  return clone;
}

/**
 * ページからクリーンなテキストを抽出する
 *
 * document.bodyから不要要素を除去し、テキストコンテンツを返す。
 * 複数の空白は1つに圧縮され、前後の空白はトリムされる。
 *
 * @returns クリーンなテキスト文字列
 */
export function extractCleanText(): string {
  const cleanedElement = cleanHtmlContent(document.body);
  const text = cleanedElement.innerText || cleanedElement.textContent || '';

  // 複数の空白を1つに圧縮し、前後の空白をトリム
  return text.replace(/\s+/g, ' ').trim();
}
