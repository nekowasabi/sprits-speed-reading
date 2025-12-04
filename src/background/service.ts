/**
 * Background Service Worker
 * Handles keyboard command events and communicates with content scripts
 */

import browser from 'webextension-polyfill';

/**
 * Handle keyboard command from manifest.json commands
 */
/**
 * Handle messages from content scripts
 */
browser.runtime.onMessage.addListener((message: unknown) => {
  if (typeof message === 'object' && message !== null && 'type' in message) {
    const msg = message as { type: string };
    if (msg.type === 'OPEN_OPTIONS_PAGE') {
      browser.runtime.openOptionsPage();
    }
  }
});

/**
 * Handle toolbar icon click - open options page
 * Manifest V3 (Chrome) uses action, V2 (Firefox) uses browserAction
 */
// @ts-ignore: browser.action exists in Manifest V3 but not in webextension-polyfill types
const actionAPI = browser.action ?? browser.browserAction;

if (actionAPI?.onClicked) {
  actionAPI.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
  });
} else {
  console.warn('Spritz Speed Reader: No action API available (browserAction/action)');
}

browser.commands.onCommand.addListener(async (command: string) => {
  if (command === 'toggle-reader') {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];

      if (activeTab?.id) {
        await browser.tabs.sendMessage(activeTab.id, { action: 'toggleReader' });
      }
    } catch (error) {
      console.error('Spritz Speed Reader: Error toggling reader:', error);
    }
  }
});

console.log('Spritz Speed Reader: Background service loaded');
