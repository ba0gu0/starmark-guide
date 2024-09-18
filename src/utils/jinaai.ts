// 使用 Jina AI API 进行网页内容获取和截图
// 提供接口进行内容获取和截图

interface JinaAIConfig {
  apiKey: string;
}

interface MarkdownResponse {
  success: true;
  title: string;
  content: string;
  pageshotUrl?: string;
  textRepresentation: string;
}

interface PageShotResponse {
  success: true;
  title?: string;
  content?: string;
  pageshotUrl: string;
  textRepresentation: string;
}

interface FailureResponse {
  success: false;
  title?: string;
  content?: string;
  pageshotUrl?: string;
  error: string;
}

type JinaAIResult = MarkdownResponse | PageShotResponse | FailureResponse;

let config: JinaAIConfig | null = null;

export function initializeJinaAI(apiKey: string) {
  config = { apiKey };
}

async function fetchJinaAI(url: string, returnFormat: 'markdown' | 'screenshot'): Promise<JinaAIResult> {
  if (!config) {
    throw new Error("Jina AI is not initialized. Call initializeJinaAI(apiKey) first.");
  }

  try {
    const response = await fetch('https://r.jina.ai/', {
      method: 'POST',
      body: JSON.stringify({ url }),
      headers: {
        "Content-Type": "application/json",
        "X-Return-Format": returnFormat,
        "Accept": "application/json",
        ...(config.apiKey && config.apiKey.startsWith('jina_') && { "Authorization": `Bearer ${config.apiKey}` })
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 200) {
      throw new Error(`API error: ${JSON.stringify(data)}`);
    }

    if (returnFormat === 'markdown') {
      return {
        success: true,
        title: data.data.title,
        content: data.data.content,
        textRepresentation: data.data.textRepresentation
      };
    } else {
      return {
        success: true,
        pageshotUrl: data.data.screenshotUrl,
        textRepresentation: data.data.textRepresentation
      };
    }
  } catch (error) {
    return { success: false, error: `${error}` };
  }
}

export async function getMarkdown(url: string): Promise<JinaAIResult> {
  return fetchJinaAI(url, 'markdown');
}

export async function getPageShot(url: string): Promise<JinaAIResult> {
  return fetchJinaAI(url, 'screenshot');
}

export async function checkJinaAIKey(apiKey: string): Promise<boolean> {
  initializeJinaAI(apiKey);
  try {
    const result = await getMarkdown('https://www.google.com');
    return result.success;
  } catch (error) {
    return false;
  } finally {
    config = null; // 重置配置，以便后续可能的初始化
  }
}
