import { browserAdapter } from '@shared/adapters/BrowserAdapter';
import { SpritzSettings, DEFAULT_WPM, DEFAULT_MAX_CHARS } from '@shared/types';

const STORAGE_KEY = 'spritzSettings';

/**
 * Load settings from browser storage.
 *
 * @returns Promise resolving to saved settings or defaults
 */
export async function loadSettings(): Promise<SpritzSettings> {
  try {
    const result = await browserAdapter.storage.local.get([STORAGE_KEY]);
    const saved = result[STORAGE_KEY] as Partial<SpritzSettings> | undefined;
    return {
      wpm: saved?.wpm ?? DEFAULT_WPM,
      maxChars: saved?.maxChars ?? DEFAULT_MAX_CHARS,
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {
      wpm: DEFAULT_WPM,
      maxChars: DEFAULT_MAX_CHARS,
    };
  }
}

/**
 * Save settings to browser storage.
 *
 * @param settings - Settings to save
 */
export async function saveSettings(settings: SpritzSettings): Promise<void> {
  try {
    await browserAdapter.storage.local.set({ [STORAGE_KEY]: settings });
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}
