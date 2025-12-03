/**
 * Background Service Worker
 * Handles keyboard command events and communicates with content scripts
 */

import browser from 'webextension-polyfill';

/**
 * Handle keyboard command from manifest.json commands
 */
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
