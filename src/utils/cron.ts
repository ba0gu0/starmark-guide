import { setCrawlLimit, getCrawlLimit } from './storage';

const CRAWL_LIMIT_RESET_INTERVAL = 60 * 1000; // 1分钟
const MAX_CRAWLS_PER_INTERVAL = 5;

export const incrementCrawlCount = async (): Promise<boolean> => {
  const currentTime = Date.now();
  const limitData = await getCrawlLimit();

  if (currentTime - limitData.lastReset > CRAWL_LIMIT_RESET_INTERVAL) {
    await setCrawlLimit({ count: 1, lastReset: currentTime });
    return true;
  }

  if (limitData.count < MAX_CRAWLS_PER_INTERVAL) {
    await setCrawlLimit({ count: limitData.count + 1, lastReset: limitData.lastReset });
    return true;
  }
  return false;
};

export const getCrawlLimitResetTime = async (): Promise<number> => {
  const limitData = await getCrawlLimit();
  const resetTime = limitData.lastReset + CRAWL_LIMIT_RESET_INTERVAL;
  return resetTime;
};
