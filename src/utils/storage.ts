// storage.ts
type SettingKey = 'locale' | 'popupAction' | 'enableScreenshotCache' | 'aiModelProvider' | 'aiModelType' | 'customModelUrl' | 'modelKey' | 'jinaKey' | 'firecrawlKey';

type SettingValue = string | boolean;


interface IDatabase {
  openDB(storeName?: string): Promise<IDBDatabase>;
  addItem(storeName: string, item: any): Promise<void>;
  getItem(storeName: string, key: string): Promise<any>;
  getAllItems(storeName: string): Promise<any[]>;
  deleteItem(storeName: string, key: string): Promise<void>;
  updateItem(storeName: string, item: any): Promise<void>;
}

class IndexedDBService implements IDatabase {
  private dbName: string;
  private dbVersion: number;

  constructor(dbName: string, dbVersion: number = 1) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
  }

  openDB(storeName?: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        this.dbVersion = db.version;  // 更新实例的版本号为当前数据库版本

        if (storeName && !db.objectStoreNames.contains(storeName)) {
          // 如果存储不存在，直接创建
          db.close();
          const upgradeRequest = indexedDB.open(this.dbName, this.dbVersion + 1);
          
          upgradeRequest.onupgradeneeded = (event) => {
            const upgradedDb = upgradeRequest.result;
            upgradedDb.createObjectStore(storeName, { keyPath: 'id' });
          };
          
          upgradeRequest.onsuccess = () => {
            this.dbVersion = upgradeRequest.result.version;  // 更新实例的版本号
            resolve(upgradeRequest.result);
          };
          
          upgradeRequest.onerror = () => reject(upgradeRequest.error);
        } else {
          resolve(db);
        }
      };
    });
  }

  async addItem(storeName: string, item: any): Promise<void> {
    const db = await this.openDB(storeName);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getItem(storeName: string, key: string): Promise<any> {
    const db = await this.openDB(storeName);
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllItems(storeName: string): Promise<any[]> {
    const db = await this.openDB(storeName);
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteItem(storeName: string, key: string): Promise<void> {
    const db = await this.openDB(storeName);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateItem(storeName: string, item: any): Promise<void> {
    const db = await this.openDB(storeName);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// 更新 dbService 的初始化
export const dbService = new IndexedDBService('StarMarkGuide');

// 通用的设置存储方法
export const setStoreSetting = async (key: SettingKey, value: SettingValue): Promise<void> => {
  await dbService.updateItem('settings', { id: key, value: value });
};

// 通用的设置获取方法
export const getStoredSetting = async <T extends SettingValue>(key: SettingKey, defaultValue: T): Promise<T> => {
  try {
    const result = await dbService.getItem('settings', key);
    return result && result.value ? (result.value as T) : defaultValue;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return defaultValue;
  }
};

const localeNameMap: Record<string, string> = {
  'en-US': 'English',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  'ja': 'Japanese',
  'es': 'Spanish',
  'ko': 'Korean',
  'th': 'Thai',
  'ms': 'Malay',
  'pt-PT': 'Portuguese',
  'de': 'German',
  'vi': 'Vietnamese',
  'fr': 'French',
  'it': 'Italian',
  'km': 'Khmer',
  'id': 'Indonesian',
  'ar': 'Arabic'
};

// 针对特定设置的便捷方法
export const setStoreLocale = (locale: string) => setStoreSetting('locale', locale);
export const getStoredLocale = () => getStoredSetting('locale', 'zh-CN');
export const getStoredLocaleName = async () => localeNameMap[await getStoredLocale()];

export const setStorePopupAction = (action: string) => setStoreSetting('popupAction', action);
export const getStoredPopupAction = () => getStoredSetting('popupAction', 'search');

export const setStoreEnableScreenshotCache = (enable: boolean) => setStoreSetting('enableScreenshotCache', enable);
export const getStoredEnableScreenshotCache = () => getStoredSetting('enableScreenshotCache', true);

export const setStoreAiModelProvider = (provider: string) => setStoreSetting('aiModelProvider', provider);
export const getStoredAiModelProvider = () => getStoredSetting('aiModelProvider', 'openai');

export const setStoreAiModelType = (type: string) => setStoreSetting('aiModelType', type);
export const getStoredAiModelType = () => getStoredSetting('aiModelType', 'gpt-4o-mini');

export const setStoreCustomModelUrl = (url: string) => setStoreSetting('customModelUrl', url);
export const getStoredCustomModelUrl = () => getStoredSetting('customModelUrl', '');

export const setStoreModelKey = (key: string) => setStoreSetting('modelKey', key);
export const getStoredModelKey = () => getStoredSetting('modelKey', '');

export const setStoreJinaKey = (key: string) => setStoreSetting('jinaKey', key);
export const getStoredJinaKey = () => getStoredSetting('jinaKey', '');

export const setStoreFirecrawlKey = (key: string) => setStoreSetting('firecrawlKey', key);
export const getStoredFirecrawlKey = () => getStoredSetting('firecrawlKey', 'this_is_just_a_preview_token');

// 保存图片预览到数据库
export const saveImagePreviewToDB = async (siteUrl: string, base64Image: string): Promise<void> => {
  try {
    await dbService.updateItem('imagePreviews', { id: siteUrl, value: base64Image }); // 存储图片数据
    console.log(`Image preview for ${siteUrl} saved successfully.`);
  } catch (error) {
    console.error(`Error saving image preview for ${siteUrl}:`, error);
  }
};

// 从数据库获取图片预览
export const getStoredImagePreview = async (siteUrl: string): Promise<string | null> => {
  try {
    const result = await dbService.getItem('imagePreviews', siteUrl);
    return result && result.value ? result.value : null;
  } catch (error) {
    console.error(`Error getting image preview for ${siteUrl}:`, error);
    return null;
  }
};

// 爬取相关的类型定义
export type CrawlStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface CrawlProgress {
  status: CrawlStatus;
  progress: number;
  lastRunTime: number;
  remainingItems: number;
}

// 爬取相关的存储方法
export const setStoreCrawlProgress = async (progress: CrawlProgress) => {
  try {
    await dbService.updateItem('crawlTask', { id: 'currentProgress', ...progress });
  } catch (error) {
    console.error('设置爬虫进度时出错:', error);
  }
};

export const getStoredCrawlProgress = async (): Promise<CrawlProgress | null> => {
  try {
    const result = await dbService.getItem('crawlTask', 'currentProgress');
    return result ? result : null;
  } catch (error) {
    console.error('获取爬虫进度时出错:', error);
    return null;
  }
};

// 爬取限制相关的存储方法
export const setCrawlLimit = async (limitData: { count: number; lastReset: number }): Promise<void> => {
  try {
    await dbService.updateItem('crawlTask', { id: 'crawlLimit', ...limitData });
  } catch (error) {
    console.error('设置爬虫限制时出错:', error);
  }
};

export const getCrawlLimit = async (): Promise<{ count: number; lastReset: number }> => {
  try {
    const result = await dbService.getItem('crawlTask', 'crawlLimit');
    return result || { count: 0, lastReset: 0 };
  } catch (error) {
    return { count: 0, lastReset: 0 };
  }
};

export interface CrawlResult {
  success: boolean;
  title?: string;
  markdown?: string;
  html?: string;
  screenshot?: string;
  error?: string;
}

export interface ChatCrawlResult {
  status: string;
  chatData?: any;
  crawlData?: CrawlResult;
  error?: string;
  type: string;
}


// 保存 chatCrawl 结果到数据库
export const saveChatCrawlResult = async (url: string, result: ChatCrawlResult): Promise<void> => {
  try {
    await dbService.updateItem('chatCrawl', { id: url, ...result });
    console.log(`ChatCrawl result for ${url} saved successfully.`);
  } catch (error) {
    console.error(`Error saving ChatCrawl result for ${url}:`, error);
  }
};

// 从数据库获取 chatCrawl 结果
export const getChatCrawlResult = async (url: string): Promise<ChatCrawlResult | null> => {
  try {
    const result = await dbService.getItem('chatCrawl', url);
    return result ? result : null;
  } catch (error) {
    console.error(`Error getting ChatCrawl result for ${url}:`, error);
    return null;
  }
};