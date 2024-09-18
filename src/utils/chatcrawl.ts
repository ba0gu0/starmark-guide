import { getStoredEnableScreenshotCache, getStoredJinaKey, getStoredFirecrawlKey, getStoredAiModelProvider, getStoredAiModelType, getStoredCustomModelUrl, getStoredModelKey, saveChatCrawlResult, ChatCrawlResult, CrawlResult, getStoredLocaleName } from './storage';
import { getPageShot, getMarkdown, initializeJinaAI } from './jinaai';
import { scrapeUrl, initializeFirecrawl } from './firecrawl';
import { chatModels } from './models';
import { CoreMessage } from 'ai';
import { getLocalizedGithubStarPrompt, getLocalizedBookMarksPrompt } from './prompt';
import { downloadImageAsBase64 } from './images';

let jinaInitialized = false;
let firecrawlInitialized = false;

const TWITTER_DOMAINS = ['twitter.com', 'x.com'];
const TWITTER_DELAY = 2000; // 2秒

async function ensureInitialized() {
  if (!jinaInitialized) {
    const jinaKey = await getStoredJinaKey();
    initializeJinaAI(jinaKey);
    jinaInitialized = true;
  }
  if (!firecrawlInitialized) {
    const firecrawlKey = await getStoredFirecrawlKey();
    initializeFirecrawl(firecrawlKey);
    firecrawlInitialized = true;
  }
}

export async function unifiedCrawl(url: string): Promise<CrawlResult> {
  await ensureInitialized();
  console.log('开始 unifiedCrawl', url);

  let result: CrawlResult = { success: false };
  let screenshot: string | null = null;

  try {
    // 首先尝试使用 Jina
    let jinaResult = await getMarkdown(url);

    // 如果是 Twitter 或 X.com，等待后重试
    if (TWITTER_DOMAINS.some(domain => url.includes(domain))) {
      await new Promise(resolve => setTimeout(resolve, TWITTER_DELAY));
      jinaResult = await getMarkdown(url);
    }

    console.log('Jina 结果:', jinaResult);
    // 检查是否需要获取截图
    const enableScreenshotCache = await getStoredEnableScreenshotCache();
    if (enableScreenshotCache) {
      const jinaPageShotResult = await getPageShot(url);
      console.log('Jina 截图结果:', jinaPageShotResult);
      if (jinaPageShotResult && jinaPageShotResult.pageshotUrl) {
        screenshot = jinaPageShotResult.pageshotUrl;
        console.log('下载截图', jinaPageShotResult.pageshotUrl, url);
        await downloadImageAsBase64(jinaPageShotResult.pageshotUrl, url);
      }
    }

    if (jinaResult && typeof jinaResult.content === 'string' &&
      !jinaResult.content.includes('Checking your Browser') &&
      !jinaResult.content.includes('Just a moment') &&
      !jinaResult.content.includes('Error 403 (Forbidden)') &&
      !jinaResult.content.includes('Error 404 (Not Found)') &&
      !jinaResult.content.includes('Error 503 (Service Unavailable)') &&
      !jinaResult.content.includes('Error 504 (Gateway Timeout)') ) {
      result = {
        success: true,
        title: jinaResult.title,
        markdown: jinaResult.content,
        screenshot: screenshot || undefined
      };
    } else {
      // 如果 Jina 失败或返回安全检查页面，使用 Firecrawl
      const firecrawlResult = await scrapeUrl(url);
      if (firecrawlResult.success) {
        result = {
          success: true,
          markdown: firecrawlResult.markdown,
          title: firecrawlResult.metadata?.title,
          screenshot: screenshot || undefined,
        };
      } else {
        result = {
          success: false,
          error: firecrawlResult.error,
          screenshot: screenshot || undefined
        };
      }
    }
  } catch (error) {
    result = {
      success: false,
      error: `爬取过程中发生错误: ${error}`,
      screenshot: screenshot || undefined
    };
  }
  return result;
}

async function processMarkdownWithAI(url: string, type: string, crawlResult: CrawlResult, onFinish: (finalContent: string) => Promise<void>): Promise<ReadableStream<Uint8Array> | null> {


  console.log('processMarkdownWithAI 开始', url, type);

  try {
    const provider = await getStoredAiModelProvider();
    const modelType = await getStoredAiModelType();
    const customUrl = await getStoredCustomModelUrl();


    const key = await getStoredModelKey();

    const prompt = type === 'bookmarks' ? getLocalizedBookMarksPrompt(await getStoredLocaleName()) : getLocalizedGithubStarPrompt(await getStoredLocaleName());

    const messages: CoreMessage[] = [
      { role: "system", content: prompt },
      { role: "user", content: crawlResult.markdown as string }
    ];

    const stream = await chatModels(provider, customUrl, key, modelType, messages, true, onFinish);
    console.log('processMarkdownWithAI 完成', url, type);

    return stream as ReadableStream<Uint8Array>;
  } catch (error) {
    console.error("处理AI请求时出错:", error);
    return null;
  }
}

export async function chatCrawl(url: string, type: string, onStart: (chatCrawlResult: ChatCrawlResult) => void): Promise<{ chatCrawlResult: ChatCrawlResult, aiStream: ReadableStream<Uint8Array> | null }> {

  console.log('chatCrawl 开始', url);
  onStart({ status: 'started', type: type });

  // 执行 unifiedCrawl
  const crawlResult = await unifiedCrawl(url);

  let chatCrawlResult: ChatCrawlResult = {
    status: 'crawled',
    crawlData: crawlResult,
    type: type
  };

  await saveChatCrawlResult(url, chatCrawlResult);
  onStart(chatCrawlResult);

  if (!crawlResult.success) {
    // unifiedCrawl 失败，直接保存结果
    console.log('unifiedCrawl 失败', url, crawlResult);
    chatCrawlResult.status = 'failed';
    chatCrawlResult.error = crawlResult.error;
    return { chatCrawlResult, aiStream: null };
  }


  // unifiedCrawl 成功，继续处理 markdown
  if (crawlResult.markdown) {
    try {
      const onFinish = async (finalContent: string) => {
        try {
          // 匹配第一个 { 和最后一个 } 之间的内容
          const jsonMatch = finalContent.match(/\{(.|\n)*\}/);
          if (jsonMatch) {
            const jsonString = jsonMatch[0];
            const jsonData = JSON.parse(jsonString);
            chatCrawlResult.status = 'finished';
            chatCrawlResult.chatData = jsonData;
            chatCrawlResult.type = type;
          } else {
            throw new Error("未找到有效的 JSON 内容");
          }
        } catch (error) {
          console.error("JSON解析失败:", error);
          chatCrawlResult.error = "JSON解析失败";
          chatCrawlResult.type = type;
        }
        onStart(chatCrawlResult);
        await saveChatCrawlResult(url, chatCrawlResult);
        console.log('chatCrawl 执行完成', url, chatCrawlResult);
      };

      const aiStream = await processMarkdownWithAI(url, type, crawlResult, onFinish);
      return { chatCrawlResult, aiStream };
    } catch (error) {
      console.log('处理AI请求时出错', error);
      chatCrawlResult.error = `处理AI请求时出错: ${error}`;
      chatCrawlResult.type = type;
      await saveChatCrawlResult(url, chatCrawlResult);
      return { chatCrawlResult, aiStream: null };
    }
  }

  return { chatCrawlResult, aiStream: null };
}
