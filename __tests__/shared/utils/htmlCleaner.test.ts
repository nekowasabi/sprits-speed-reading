/**
 * HTMLクリーナーのユニットテスト
 * TDDアプローチ: テストを先に書き、実装はテストに従う
 */

import {
  REMOVABLE_SELECTORS,
  cleanHtmlContent,
  extractCleanText,
} from '@shared/utils/htmlCleaner';

describe('htmlCleaner', () => {
  describe('REMOVABLE_SELECTORS', () => {
    it('should include navigation elements', () => {
      expect(REMOVABLE_SELECTORS).toContain('nav');
      expect(REMOVABLE_SELECTORS).toContain('[role="navigation"]');
    });

    it('should include header and footer', () => {
      expect(REMOVABLE_SELECTORS).toContain('header');
      expect(REMOVABLE_SELECTORS).toContain('footer');
      expect(REMOVABLE_SELECTORS).toContain('[role="banner"]');
      expect(REMOVABLE_SELECTORS).toContain('[role="contentinfo"]');
    });

    it('should include sidebar and aside', () => {
      expect(REMOVABLE_SELECTORS).toContain('aside');
      expect(REMOVABLE_SELECTORS).toContain('[role="complementary"]');
      expect(REMOVABLE_SELECTORS.some((s) => s.includes('sidebar'))).toBe(true);
    });

    it('should include advertisement-related selectors', () => {
      expect(REMOVABLE_SELECTORS.some((s) => s.includes('ad'))).toBe(true);
      expect(REMOVABLE_SELECTORS.some((s) => s.includes('banner'))).toBe(true);
      expect(REMOVABLE_SELECTORS.some((s) => s.includes('sponsor'))).toBe(true);
    });

    it('should include social and share elements', () => {
      expect(REMOVABLE_SELECTORS.some((s) => s.includes('share'))).toBe(true);
      expect(REMOVABLE_SELECTORS.some((s) => s.includes('social'))).toBe(true);
    });

    it('should include comment sections', () => {
      expect(REMOVABLE_SELECTORS.some((s) => s.includes('comment'))).toBe(true);
    });
  });

  describe('cleanHtmlContent', () => {
    beforeEach(() => {
      // DOMをリセット
      document.body.innerHTML = '';
    });

    it('should remove nav elements', () => {
      document.body.innerHTML = `
        <nav>Navigation Menu</nav>
        <article>Main Content</article>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Navigation Menu');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove header elements', () => {
      document.body.innerHTML = `
        <header>Site Header</header>
        <main>Main Content</main>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Site Header');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove footer elements', () => {
      document.body.innerHTML = `
        <article>Main Content</article>
        <footer>Site Footer</footer>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Site Footer');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove aside elements', () => {
      document.body.innerHTML = `
        <article>Main Content</article>
        <aside>Sidebar Content</aside>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Sidebar Content');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove elements with role="navigation"', () => {
      document.body.innerHTML = `
        <div role="navigation">Navigation Links</div>
        <article>Main Content</article>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Navigation Links');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove elements with role="banner"', () => {
      document.body.innerHTML = `
        <div role="banner">Banner Header</div>
        <article>Main Content</article>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Banner Header');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove elements with role="contentinfo"', () => {
      document.body.innerHTML = `
        <article>Main Content</article>
        <div role="contentinfo">Footer Info</div>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Footer Info');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove elements with role="complementary"', () => {
      document.body.innerHTML = `
        <article>Main Content</article>
        <div role="complementary">Sidebar Info</div>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Sidebar Info');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove elements with ad-related classes', () => {
      document.body.innerHTML = `
        <div class="ad-container">Advertisement</div>
        <div class="ads-wrapper">More Ads</div>
        <article>Main Content</article>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Advertisement');
      expect(result.textContent).not.toContain('More Ads');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove elements with ad-related ids', () => {
      document.body.innerHTML = `
        <div id="ad-banner">Ad Banner</div>
        <div id="ads-sidebar">Sidebar Ad</div>
        <article>Main Content</article>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Ad Banner');
      expect(result.textContent).not.toContain('Sidebar Ad');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove elements with banner classes', () => {
      document.body.innerHTML = `
        <div class="banner-top">Top Banner</div>
        <article>Main Content</article>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Top Banner');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove sponsor elements', () => {
      document.body.innerHTML = `
        <div class="sponsor-content">Sponsored Content</div>
        <article>Main Content</article>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Sponsored Content');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove share and social elements', () => {
      document.body.innerHTML = `
        <div class="share-buttons">Share this</div>
        <div class="social-links">Follow us</div>
        <article>Main Content</article>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Share this');
      expect(result.textContent).not.toContain('Follow us');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove comment sections', () => {
      document.body.innerHTML = `
        <article>Main Content</article>
        <div class="comments-section">User Comments</div>
        <div id="comments">More Comments</div>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('User Comments');
      expect(result.textContent).not.toContain('More Comments');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove sidebar elements', () => {
      document.body.innerHTML = `
        <article>Main Content</article>
        <div class="sidebar">Sidebar Content</div>
        <div id="sidebar">More Sidebar</div>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Sidebar Content');
      expect(result.textContent).not.toContain('More Sidebar');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove related/recommended content', () => {
      document.body.innerHTML = `
        <article>Main Content</article>
        <div class="related-posts">Related Posts</div>
        <div class="recommended-articles">Recommended</div>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Related Posts');
      expect(result.textContent).not.toContain('Recommended');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove newsletter and subscribe elements', () => {
      document.body.innerHTML = `
        <article>Main Content</article>
        <div class="newsletter-signup">Subscribe to Newsletter</div>
        <div class="subscribe-form">Subscribe Form</div>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Subscribe to Newsletter');
      expect(result.textContent).not.toContain('Subscribe Form');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove popup and modal elements', () => {
      document.body.innerHTML = `
        <article>Main Content</article>
        <div class="popup">Popup Content</div>
        <div class="modal">Modal Content</div>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Popup Content');
      expect(result.textContent).not.toContain('Modal Content');
      expect(result.textContent).toContain('Main Content');
    });

    it('should remove cookie notice elements', () => {
      document.body.innerHTML = `
        <article>Main Content</article>
        <div class="cookie-notice">Cookie Notice</div>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Cookie Notice');
      expect(result.textContent).toContain('Main Content');
    });

    it('should not modify the original document body', () => {
      document.body.innerHTML = `
        <nav>Navigation</nav>
        <article>Main Content</article>
      `;
      const originalHtml = document.body.innerHTML;

      cleanHtmlContent(document.body);

      expect(document.body.innerHTML).toBe(originalHtml);
    });

    it('should handle nested removable elements', () => {
      document.body.innerHTML = `
        <div>
          <nav>
            <div class="social-links">Social in Nav</div>
          </nav>
          <article>Main Content</article>
        </div>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).not.toContain('Social in Nav');
      expect(result.textContent).toContain('Main Content');
    });

    it('should preserve main content with multiple paragraphs', () => {
      document.body.innerHTML = `
        <nav>Navigation</nav>
        <article>
          <p>First paragraph.</p>
          <p>Second paragraph.</p>
          <p>Third paragraph.</p>
        </article>
        <footer>Footer</footer>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).toContain('First paragraph');
      expect(result.textContent).toContain('Second paragraph');
      expect(result.textContent).toContain('Third paragraph');
    });

    it('should handle empty body', () => {
      document.body.innerHTML = '';

      const result = cleanHtmlContent(document.body);

      expect(result.textContent).toBe('');
    });

    it('should handle body with only removable elements', () => {
      document.body.innerHTML = `
        <nav>Navigation</nav>
        <footer>Footer</footer>
      `;

      const result = cleanHtmlContent(document.body);

      expect(result.textContent?.trim()).toBe('');
    });
  });

  describe('extractCleanText', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('should return cleaned text as string', () => {
      document.body.innerHTML = `
        <nav>Navigation</nav>
        <article>This is the main content.</article>
        <footer>Footer</footer>
      `;

      const result = extractCleanText();

      expect(result).toContain('This is the main content');
      expect(result).not.toContain('Navigation');
      expect(result).not.toContain('Footer');
    });

    it('should return empty string for empty body', () => {
      document.body.innerHTML = '';

      const result = extractCleanText();

      expect(result).toBe('');
    });

    it('should collapse multiple whitespaces', () => {
      document.body.innerHTML = `
        <article>
          First    paragraph.


          Second paragraph.
        </article>
      `;

      const result = extractCleanText();

      // 複数の空白が1つに圧縮されることを確認
      expect(result).not.toMatch(/\s{2,}/);
    });

    it('should trim leading and trailing whitespace', () => {
      document.body.innerHTML = `
        <article>  Main content  </article>
      `;

      const result = extractCleanText();

      expect(result).not.toMatch(/^\s/);
      expect(result).not.toMatch(/\s$/);
    });

    it('should work with complex real-world-like HTML', () => {
      document.body.innerHTML = `
        <header>
          <nav class="main-nav">
            <a href="/">Home</a>
            <a href="/about">About</a>
          </nav>
        </header>
        <main>
          <article>
            <h1>Article Title</h1>
            <p>This is the first paragraph of the article.</p>
            <p>This is the second paragraph with more details.</p>
          </article>
          <aside class="sidebar">
            <div class="ad-container">Advertisement</div>
            <div class="related-posts">Related Posts</div>
          </aside>
        </main>
        <footer>
          <div class="social-links">Follow us on Twitter</div>
          <p>Copyright 2024</p>
        </footer>
        <div class="cookie-notice">We use cookies</div>
      `;

      const result = extractCleanText();

      // 本文が含まれていることを確認
      expect(result).toContain('Article Title');
      expect(result).toContain('first paragraph');
      expect(result).toContain('second paragraph');

      // 不要要素が除去されていることを確認
      expect(result).not.toContain('Home');
      expect(result).not.toContain('About');
      expect(result).not.toContain('Advertisement');
      expect(result).not.toContain('Related Posts');
      expect(result).not.toContain('Follow us on Twitter');
      expect(result).not.toContain('Copyright');
      expect(result).not.toContain('cookies');
    });
  });
});
