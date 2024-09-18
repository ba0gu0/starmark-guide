// 使用 @mendable/firecrawl-js 进行爬虫，从设置中获取api key
// 提供接口进行爬虫

import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';

let app: FirecrawlApp | null = null;

interface FailureResponse {
  success: false;
  error: string;
  warning?: string;
}

type ScrapeResult = ScrapeResponse<any> | FailureResponse;

export function initializeFirecrawl(apiKey: string) {
  app = new FirecrawlApp({ apiKey });
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  if (!app) {
    throw new Error("FirecrawlApp is not initialized. Call initializeFirecrawl(apiKey) first.");
  }

  try {
    const scrapeResult = await app.scrapeUrl(url, { formats: ['markdown', 'html'] }) as ScrapeResponse<any>;

    return scrapeResult;
  } catch (error) {
    return { success: false, error: `${error}` };
  }
}

export async function checkFirecrawlKey(apiKey: string): Promise<boolean> {
  initializeFirecrawl(apiKey);
  try {
    const result = await scrapeUrl('https://www.google.com');
    return result.success;
  } catch (error) {
    return false;
  } finally {
    app = null; // 重置app，以便后续可能的初始化
  }
}
