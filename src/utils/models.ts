// 导入所需的库
import { generateText, streamText, LanguageModelV1, CoreMessage, ToolContent } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAzure } from '@ai-sdk/azure';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createCohere } from '@ai-sdk/cohere';

// 导入新增的提供商
import { createOllama } from 'ollama-ai-provider';
import { chromeai } from 'chrome-ai';
import { createWorkersAI } from 'workers-ai-provider'; // 加入 workersAI

import { encoding_for_model, get_encoding, TiktokenModel, TiktokenEncoding } from 'tiktoken';


interface ModelProvider {
  value: string;
  label: string;
  apiUrl: string;
}

export interface ModelType {
  value: string;
  label: string;
}


const DEFAULT_OLLAMA_MODELS = [
  { value: 'llama3.1:latest', label: 'Ollama Llama 3.1 8B Instruct' },
  { value: 'phi3:latest', label: 'Ollama Phi3 14B Instruct' },
  { value: 'mistral:latest', label: 'Ollama Mistral 7B Instruct' },
  { value: 'mixtral:latest', label: 'Ollama Mixtral 8x7B Instruct' },
  { value: 'command-r:latest', label: 'Ollama Command-R 35B Instruct' },
  { value: 'deepseek-v2:latest', label: 'Ollama DeepSeek Chat 16B Instruct' },
  { value: 'qwen2:latest', label: 'Ollama Qwen2 7B Instruct' },
  { value: 'gemma2:latest', label: 'Ollama Gemma2 9B Instruct' },
];

const DEFAULT_OLLAMA_TOKEN_MAP = {
  'llama3.1:latest': { maxTokens: 4096, encodingName: 'cl100k_base' },
  'phi3:latest': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'mistral:latest': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'mixtral:latest': { maxTokens: 32768, encodingName: 'cl100k_base' },
  'command-r:latest': { maxTokens: 32768, encodingName: 'cl100k_base' },
  'deepseek-v2:latest': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'qwen2:latest': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'gemma2:latest': { maxTokens: 8192, encodingName: 'cl100k_base' },
};

interface OllamaModelDetails {
  name: string;
  model: string;
  details: {
    parameter_size: string;
    quantization_level: string;
  };
}

export async function getOllamaModels(apiUrl: string): Promise<ModelType[]> {
  try {
    const response = await fetch(`${apiUrl}/tags`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.models.map((model: OllamaModelDetails) => ({
      value: model.name,
      label: `Ollama ${model.name} (${model.details.parameter_size}, ${model.details.quantization_level})`
    }));
  } catch (error) {
    console.error('获取Ollama模型列表失败:', error);
    return DEFAULT_OLLAMA_MODELS;
  }
}


export const modelProviderOptions: ModelProvider[] = [
  { value: 'openai', label: 'OpenAI', apiUrl: 'https://api.openai.com/v1' },
  { value: 'azure', label: 'Azure OpenAI', apiUrl: 'https://api.openai.azure.com/v1' },
  { value: 'anthropic', label: 'Anthropic', apiUrl: 'https://api.anthropic.com/v1' },
  { value: 'google', label: 'Google', apiUrl: 'https://generativelanguage.googleapis.com/v1beta2' },
  { value: 'mistral', label: 'Mistral', apiUrl: 'https://api.mistral.ai' },
  { value: 'cohere', label: 'Cohere', apiUrl: 'https://api.cohere.ai/v1' },
  { value: 'novita', label: 'Novita', apiUrl: 'https://api.novita.ai/v1' },
  { value: 'groq', label: 'Groq', apiUrl: 'https://api.groq.com/v1' },

  { value: 'chatglm', label: 'ZhiPu', apiUrl: 'https://open.bigmodel.cn/api/paas/v4' },
  { value: 'deepseek', label: 'Deepseek', apiUrl: 'https://api.deepseek.com/v1' },
  { value: 'kimi', label: 'Kimi', apiUrl: 'https://api.moonshot.cn/v1' },
  { value: 'qwen', label: 'Qwen', apiUrl: 'https://dashscope.aliyuncs.com/api/v1' },

  { value: 'chrome-ai', label: 'Chrome AI', apiUrl: '' },
  { value: 'workers-ai', label: 'Workers AI', apiUrl: 'https://api.workers-ai.com' },
  { value: 'ollama', label: 'Ollama', apiUrl: 'http://127.0.0.1:11434/api' },

];

// 将 getModelTypeOptions 改为异步函数
export function getModelTypeOptions(provider: string): ModelType[] {
  switch (provider) {
    case 'openai':
    case 'azure':
      return [
        { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-3-turbo', label: 'GPT-3 Turbo' },
        { value: 'o1-preview', label: 'O1-preview' },
        { value: 'o1-mini', label: 'O1-mini' },
      ];
    case 'anthropic':
      return [
        { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
        { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
        { value: 'claude-3-opus', label: 'Claude 3 Opus' },
        { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
      ];
    case 'google':
      return [
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
      ];
    case 'mistral':
      return [
        { value: 'mistral-7b-v0.1', label: 'Mistral 7B v0.1' },
      ];
    case 'cohere':
      return [
        { value: 'command', label: 'Command' },
        { value: 'command-light', label: 'Command Light' },
      ];
    case 'novita':
      return [
        { value: 'meta-llama/llama-3.1-8b-instruct', label: 'Novita Meta Llama 3.1 8B Instruct' },
        { value: 'meta-llama/llama-3.1-70b-instruct', label: 'Novita Meta Llama 3.1 70B Instruct' },
        { value: 'mistralai/mistral-7b-instruct', label: 'Novita Mistral 7B Instruct' },
        { value: 'Nous-Hermes-2-Mixtral-8x7B-DPO', label: 'Novita Nous Hermes 2 Mixtral 8x7B DPO' },
      ];
    case 'groq':
      return [
        { value: 'llama-3-8b-instruct', label: 'Groq Llama 3 8B Instruct' },
        { value: 'llama-3-70b-instruct', label: 'Groq Llama 3 70B Instruct' },
        { value: 'mixtral-8x7b-32768', label: 'Groq Mixtral 8x7B 32768' },
        { value: 'gemma2-9b-it', label: 'Groq Gemma2 9B IT' },
      ];

    case 'chatglm':
      return [
        { value: 'GLM-4-Plus', label: 'GLM4 Plus' },
        { value: 'GLM-4-0520', label: 'GLM4 0520' },
        { value: 'GLM-4-Air', label: 'GLM4 Air' },
      ];
    case 'deepseek':
      return [
        { value: 'deepseek-chat', label: 'DeepSeek Chat' },
        { value: 'deepseek-coder', label: 'DeepSeek Coder' },
      ];
    case 'kimi':
      return [
        { value: 'moonshot-v1-8k', label: 'Moonshot v1 8K' },
        { value: 'moonshot-v1-128k', label: 'Moonshot v1 128K' },
      ];
    case 'qwen':
      return [
        { value: 'qwen-turbo', label: 'Qwen Turbo' },
        { value: 'qwen-plus', label: 'Qwen Plus' },
        {value: 'qwen-max', label: 'Qwen Max'}
      ];

    case 'chrome-ai':
      return [
        { value: 'generic', label: 'Chrome GPT' },
      ];
    case 'workers-ai':
      return [
        { value: 'workers-gpt', label: 'Workers GPT' },
      ];
    case 'ollama':
      return DEFAULT_OLLAMA_MODELS;
    default:
      return [];
  }
}

function countTokens(text: string, modelName: TiktokenModel | TiktokenEncoding): number {
  // 根据模型名称获取对应的编码器
  let encoding;
  try {
    encoding = encoding_for_model(modelName as TiktokenModel);
  } catch (error) {
    encoding = get_encoding('cl100k_base' as TiktokenEncoding);
  }

  try {
    const tokens = encoding.encode(text);
    return tokens.length;
  } finally {
    encoding.free();
  }
}

interface ModelTokenInfo {
  maxTokens: number;
  encodingName: TiktokenModel | TiktokenEncoding; // 添加编码器名称
}

function truncateMessages(
  messages: CoreMessage[],
  maxTokens: number,
  encodingName: TiktokenModel | TiktokenEncoding,
  reserveTokens: number = 800
): CoreMessage[] {
  let totalTokens = 0;
  const truncatedMessages: CoreMessage[] = [];

  // 首先添加系统消息（如果存在）
  const systemMessage = messages.find(msg => msg.role === 'system');
  if (systemMessage) {
    const systemTokenCount = countTokens(systemMessage.content as string, encodingName);
    totalTokens += systemTokenCount;
    truncatedMessages.push(systemMessage);
  }

  // 然后处理用户消息
  const userMessage = messages.find(msg => msg.role === 'user');
  if (userMessage) {
    const userTokenCount = countTokens(userMessage.content as string, encodingName);
    const remainingTokens = maxTokens - totalTokens - reserveTokens;
    
    if (userTokenCount > remainingTokens) {
      // 如果用户消息超过剩余令牌数，则截断
      const truncatedContent = truncateText(userMessage.content as string, remainingTokens, encodingName);
      truncatedMessages.push({ role: 'user', content: truncatedContent } as CoreMessage);
    } else {
      // 如果用户消息未超过剩余令牌数，则完整添加
      truncatedMessages.push(userMessage);
    }
  }

  return truncatedMessages;
}

/**
 * 截断文本以适应剩余的令牌数
 * @param text 原始文本
 * @param maxTokens 最大令牌数
 * @param encodingName 编码器名称
 * @returns 截断后的文本
 */
function truncateText(text: string, maxTokens: number, encodingName: TiktokenModel | TiktokenEncoding): string {
  let encoding;
  try {
    encoding = encoding_for_model(encodingName as TiktokenModel);
  } catch (error) {
    encoding = get_encoding('cl100k_base' as TiktokenEncoding);
  }

  try {
    const tokens = encoding.encode(text);
    
    if (tokens.length <= maxTokens) {
      return text;
    }
    
    const truncatedTokens = tokens.slice(0, maxTokens);
    const decodedBytes = encoding.decode(truncatedTokens);
    return new TextDecoder().decode(decodedBytes);
  } catch (error) {
    return text.slice(0, maxTokens * 4); // 粗略估计，每个token约4个字符
  } finally {
    if (encoding) {
      encoding.free();
    }
  }
}

const modelMaxTokenMap: Record<string, ModelTokenInfo> = {
  // OpenAI 模型
  'gpt-3-turbo': { maxTokens: 4096, encodingName: 'gpt-3.5-turbo' },
  'gpt-4o-mini': { maxTokens: 8192, encodingName: 'gpt-4' },
  'gpt-4o': { maxTokens: 8192, encodingName: 'gpt-4' },
  'o1-preview': { maxTokens: 16384, encodingName: 'gpt-4-32k' },
  'o1-mini': { maxTokens: 8192, encodingName: 'gpt-4' },
  // Anthropic 模型
  'claude-3-5-sonnet': { maxTokens: 100000, encodingName: 'cl100k_base' }, // Anthropic 模型一般支持更大的上下文
  'claude-3-sonnet': { maxTokens: 100000, encodingName: 'cl100k_base' },
  'claude-3-opus': { maxTokens: 100000, encodingName: 'cl100k_base' },
  'claude-3-haiku': { maxTokens: 100000, encodingName: 'cl100k_base' },
  // Google 模型
  'gemini-1.5-flash': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'gemini-1.5-pro': { maxTokens: 16384, encodingName: 'cl100k_base' },
  // Mistral 模型
  'mistral-7b-v0.1': { maxTokens: 8192, encodingName: 'cl100k_base' },
  // Cohere 模型
  'command': { maxTokens: 4096, encodingName: 'cl100k_base' },
  'command-light': { maxTokens: 4096, encodingName: 'cl100k_base' },
  // Novita 模型
  'meta-llama/llama-3.1-8b-instruct': { maxTokens: 4096, encodingName: 'cl100k_base' },
  'meta-llama/llama-3.1-70b-instruct': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'mistralai/mistral-7b-instruct': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'Nous-Hermes-2-Mixtral-8x7B-DPO': { maxTokens: 8192, encodingName: 'cl100k_base' },
  // Groq 模型
  'llama-3-8b-instruct': { maxTokens: 4096, encodingName: 'cl100k_base' },
  'llama-3-70b-instruct': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'mixtral-8x7b-32768': { maxTokens: 32768, encodingName: 'cl100k_base' },
  'gemma2-9b-it': { maxTokens: 4096, encodingName: 'cl100k_base' },
  // ChatGLM 模型
  'GLM-4-Plus': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'GLM-4-0520': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'GLM-4-Air': { maxTokens: 8192, encodingName: 'cl100k_base' },
  // Deepseek 模型
  'deepseek-chat': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'deepseek-coder': { maxTokens: 8192, encodingName: 'cl100k_base' },
  // Kimi 模型
  'moonshot-v1-8k': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'moonshot-v1-128k': { maxTokens: 128000, encodingName: 'cl100k_base' },
  // Qwen 模型
  'qwen-turbo': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'qwen-plus': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'qwen-max': { maxTokens: 16384, encodingName: 'cl100k_base' },
  // Ollama 模型
  'llama3.1:latest': { maxTokens: 4096, encodingName: 'cl100k_base' },
  'phi3:latest': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'mistral:latest': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'mixtral:latest': { maxTokens: 32768, encodingName: 'cl100k_base' },
  'command-r:latest': { maxTokens: 32768, encodingName: 'cl100k_base' },
  'deepseek-v2:latest': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'qwen2:latest': { maxTokens: 8192, encodingName: 'cl100k_base' },
  'gemma2:latest': { maxTokens: 8192, encodingName: 'cl100k_base' },
  // 其他模型根据实际情况补充
};

const createModels = (provider: string, modelType: string, url: string, key: string): LanguageModelV1 => {
  switch (provider) {
    case 'openai':
      const openai = createOpenAI({
        apiKey: key,
        baseURL: url,
        compatibility: 'strict'
      });
      return openai(modelType);
    case 'azure':
      const azure = createAzure({
        apiKey: key,
        baseURL: url,
      });
      return azure(modelType);
    case 'chatglm':
    case 'qwen':
    case 'novita':
    case 'groq':
    case 'deepseek':
    case 'kimi':
      const general = createOpenAI({
        apiKey: key,
        baseURL: url,
        compatibility: 'compatible'
      });
      return general(modelType);
    case 'anthropic':
      const anthropic = createAnthropic({
        apiKey: key,
        baseURL: url,
      });
      return anthropic(modelType);
    case 'google':
      const google = createGoogleGenerativeAI({
        apiKey: key,
        baseURL: url,
      });
      return google(modelType);
    case 'mistral':
      const mistral = createMistral({
        apiKey: key,
        baseURL: url,
      });
      return mistral(modelType);
    case 'cohere':
      const cohere = createCohere({
        apiKey: key,
        baseURL: url,
      });
      return cohere(modelType);

    case 'chrome-ai':
      return chromeai();
    case 'workers-ai':
      const workersai = createWorkersAI({
        binding: key
      });
      return workersai(modelType);
    case 'ollama':
      const ollama = createOllama({
        baseURL: url
      });
      return ollama(modelType);
    default:
      throw new Error('Invalid provider');
  }
}

export async function chatModels(
  provider: string,
  url: string,
  key: string,
  modelType: string,
  messages: CoreMessage[],
  stream: boolean = true,
  onFinish: (finalContent: string) => Promise<void> = async () => { },
  prompt: string = 'As an assistant, please answer questions seriously.',
): Promise<ReadableStream | string | null> {
  try {

    const model = createModels(provider, modelType, url, key);
        
    const modelInfo = modelMaxTokenMap[modelType] || { maxTokens: 8192, encodingName: 'cl100k_base' };

    const truncatedMessages = truncateMessages(messages, modelInfo.maxTokens, modelInfo.encodingName || modelType as TiktokenModel);


    if (stream) {
      const responseStream = await streamText({
        model: model as LanguageModelV1,
        messages: truncatedMessages as CoreMessage[],
        onFinish({ text, toolCalls, toolResults, finishReason, usage }) {
          onFinish(text);
        }
      });
      return responseStream.textStream;
    } else {
      const { text } = await generateText({
        model: model as LanguageModelV1,
        messages: truncatedMessages as CoreMessage[],
      });
      return text;
    }
  } catch (error) {
    throw error;
  }
}

export async function checkModelSettings(
  provider: string,
  url: string,
  key: string,
  modelType: string,
  stream: boolean = false
): Promise<boolean> {
  try {
    const testMessages: CoreMessage[] = [{ role: "user", content: "echo test" } as CoreMessage];
    const result = await chatModels(provider, url, key, modelType, testMessages, stream);
    return result !== null;
  } catch (error) {
    return false;
  }
}