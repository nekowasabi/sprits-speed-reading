/**
 * Content Script Entry Point
 * Initializes Shadow DOM and renders React Spritz overlay
 */

import { createRoot, Root } from 'react-dom/client';
import { browserAdapter } from '@shared/adapters/BrowserAdapter';
import { SpritzOverlay } from './components/SpritzOverlay';

let shadowRoot: ShadowRoot | null = null;
let reactRoot: Root | null = null;
let containerElement: HTMLElement | null = null;

/**
 * Initialize Shadow DOM for style isolation
 */
function initializeShadowDOM(): ShadowRoot {
  const container = document.createElement('div');
  container.id = 'spritz-reader-root';
  document.body.appendChild(container);
  containerElement = container;

  const shadow = container.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial;
      display: block;
    }

    * {
      box-sizing: border-box;
    }
  `;
  shadow.appendChild(style);

  return shadow;
}

/**
 * Mount the Spritz overlay
 */
function mountOverlay(): void {
  if (shadowRoot) return;

  shadowRoot = initializeShadowDOM();

  const rootElement = document.createElement('div');
  rootElement.id = 'spritz-react-root';
  shadowRoot.appendChild(rootElement);

  reactRoot = createRoot(rootElement);
  reactRoot.render(<SpritzOverlay onClose={unmountOverlay} />);

  console.log('Spritz Speed Reader: Overlay mounted');
}

/**
 * Unmount the Spritz overlay
 */
function unmountOverlay(): void {
  if (reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }

  if (shadowRoot) {
    shadowRoot = null;
  }

  if (containerElement) {
    containerElement.remove();
    containerElement = null;
  }

  console.log('Spritz Speed Reader: Overlay unmounted');
}

/**
 * Toggle the overlay visibility
 */
function toggleOverlay(): void {
  if (shadowRoot) {
    unmountOverlay();
  } else {
    mountOverlay();
  }
}

/**
 * Listen for messages from background script
 */
browserAdapter.runtime.onMessage.addListener((message, _sender) => {
  if (typeof message === 'object' && message !== null && 'action' in message) {
    const msg = message as { action: string };

    if (msg.action === 'toggleReader') {
      toggleOverlay();
      return Promise.resolve({ status: 'toggled', isActive: !!shadowRoot });
    }
  }

  return Promise.resolve({ status: 'unknown' });
});

console.log('Spritz Speed Reader: Content script loaded');
