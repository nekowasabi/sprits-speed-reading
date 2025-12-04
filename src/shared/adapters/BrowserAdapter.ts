import browser from 'webextension-polyfill';

export interface IStorageArea {
  get(keys: string[]): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(keys: string[]): Promise<void>;
  clear(): Promise<void>;
}

export interface IStorageAdapter {
  local: IStorageArea;
  sync: IStorageArea;
}

export type MessageListener = (
  message: unknown,
  sender: browser.Runtime.MessageSender
) => Promise<unknown> | void;

export interface IRuntimeAdapter {
  onMessage: {
    addListener(callback: MessageListener): void;
  };
  sendMessage(message: unknown): Promise<unknown>;
  openOptionsPage(): Promise<void>;
}

export interface IBrowserAdapter {
  storage: IStorageAdapter;
  runtime: IRuntimeAdapter;
}

export class BrowserAdapter implements IBrowserAdapter {
  private static instance: BrowserAdapter;

  public readonly storage: IStorageAdapter;
  public readonly runtime: IRuntimeAdapter;

  private constructor() {
    this.storage = {
      local: {
        get: async (keys: string[]) => {
          return browser.storage.local.get(keys);
        },
        set: async (items: Record<string, unknown>) => {
          return browser.storage.local.set(items);
        },
        remove: async (keys: string[]) => {
          return browser.storage.local.remove(keys);
        },
        clear: async () => {
          return browser.storage.local.clear();
        },
      },
      sync: {
        get: async (keys: string[]) => {
          return browser.storage.sync.get(keys);
        },
        set: async (items: Record<string, unknown>) => {
          return browser.storage.sync.set(items);
        },
        remove: async (keys: string[]) => {
          return browser.storage.sync.remove(keys);
        },
        clear: async () => {
          return browser.storage.sync.clear();
        },
      },
    };

    this.runtime = {
      onMessage: {
        addListener: (callback: MessageListener) => {
          browser.runtime.onMessage.addListener(callback);
        },
      },
      sendMessage: async (message: unknown) => {
        return browser.runtime.sendMessage(message);
      },
      openOptionsPage: async () => {
        // Content Script から直接 openOptionsPage() は呼び出せないため
        // Background Script にメッセージを送信して処理を委譲
        return browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' });
      },
    };
  }

  public static getInstance(): BrowserAdapter {
    if (!BrowserAdapter.instance) {
      BrowserAdapter.instance = new BrowserAdapter();
    }
    return BrowserAdapter.instance;
  }
}

export const browserAdapter = BrowserAdapter.getInstance();
