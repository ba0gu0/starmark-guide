<template>
  <div class="crawl-container">
    <h1 class="crawl-h1">{{ i18.t('options.crawl.title') }}</h1>
    <div class="content-container">
      <div class="crawl-left">
        <Card class="crawl-card">
          <template #title>
            <h3 :style="getTitleStyle(0)">{{ i18.t('options.crawl.control') }}</h3>
          </template>
          <div class="control-container">
            <div class="control-left">
              <div class="update-mode">
                <div>{{ i18.t('options.crawl.updateMode') }}：</div>
                <RadioGroup v-model="updateAll" style="margin-top: 5px;">
                  <Radio :value="false">{{ i18.t('options.crawl.updateNew') }}</Radio>
                  <Radio :value="true">{{ i18.t('options.crawl.updateAll') }}</Radio>
                </RadioGroup>
              </div>
              <p class="update-mode-description">
                {{ updateAll ? i18.t('options.crawl.updateAllDescription') : i18.t('options.crawl.updateNewDescription')
                }}
              </p>
              <p>{{ i18.t('options.crawl.controlHint') }}</p>
              <Space>
                <Button @click="startCrawl" type="primary" :loading="isCrawling">
                  {{ isCrawling ? i18.t('options.crawl.crawling') : i18.t('options.crawl.startCrawl') }}
                </Button>
                <Button @click="stopCrawl" :disabled="!isCrawling">
                  {{ i18.t('options.crawl.stopCrawl') }}
                </Button>
              </Space>
            </div>
            <div class="control-right">
              <div v-if="showCountdown" class="rate-limit-container">
                <span class="rate-limit-text">{{ i18.t('options.crawl.rateLimit') }}</span>
                <Tooltip :content="i18.t('options.crawl.rateLimitHint')">
                  <IconQuestionCircle class="rate-limit-icon" />
                </Tooltip>
              </div>
              <div v-if="showCountdown" class="countdown-container">
                <Progress type="circle" :percent="timerProgress" :stroke-width="6" :width="50">
                  <template #text>
                    <span>{{ remainingTime }}s</span>
                  </template>
                </Progress>
              </div>
            </div>
          </div>
        </Card>

        <Card class="crawl-card">
          <template #title>
            <h3 :style="getTitleStyle(1)">{{ i18.t('options.crawl.results') }}</h3>
          </template>
          <div v-if="crawlResults.length === 0" class="empty-container">
            <Empty :image-size="150" :description="i18.t('options.crawl.resultsPlaceholder')" />
          </div>
          <div v-else class="results-container">
            <Progress :percent="crawlProgress" :stroke-width="8" style="margin-bottom: 20px; height: 16px;" />
            <TransitionGroup name="list">
              <div v-for="item in displayedResults" :key="item.id" class="result-item">
                <div class="result-info">
                  <span class="result-title" :title="item.title">{{ item.title }}</span>
                  <span class="result-url" :title="item.url">{{ item.url }}</span>
                </div>
                <span class="result-status" :class="getStatusClass(item.status)"></span>
              </div>
            </TransitionGroup>
          </div>
        </Card>
      </div>

      <div class="crawl-right">
        <Card class="crawl-card ai-stream-card">
          <template #title>
            <h3 :style="getTitleStyle(2)" class="ai-stream-title">{{ i18.t('options.crawl.aiStream') }}</h3>
          </template>
          <div class="ai-stream-container">
            <template v-if="aiStreamContent">
              <pre ref="aiStreamContentRef" class="ai-stream-content">{{ aiStreamContent }}</pre>
            </template>
            <template v-else>
              <div class="ai-stream-placeholder">
                <Empty :description="i18.t('options.crawl.aiStreamPlaceholder')" :image-size="150" />
              </div>
            </template>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, onUnmounted, watch, nextTick } from 'vue';
import { useLocale } from '../../utils/locale';
import { Space, Card, Button, Progress, Message, Empty, Tooltip, RadioGroup, Radio } from '@arco-design/web-vue';
import { IconQuestionCircle } from '@arco-design/web-vue/es/icon';
import { incrementCrawlCount, getCrawlLimitResetTime } from '../../utils/cron';
import { chatCrawl } from '../../utils/chatcrawl';
import { getChatCrawlResult, ChatCrawlResult, getStoredAiModelProvider, getStoredModelKey, getStoredCustomModelUrl, getStoredAiModelType } from '../../utils/storage';
import { checkModelSettings } from '../../utils/models';

const { info: infoMessage, error: errorMessage, success: successMessage, warning: warningMessage } = Message;

const { i18 } = useLocale();

const isCrawling = ref(false);
const shouldStopCrawling = ref(false);
const crawlProgress = ref();
const crawlResults = ref<Array<{ id: number; title: string; url: string; status: string }>>([]);
const timerProgress = ref(0);
const remainingTime = ref(0);
const statusText = ref('');
let timer: number | null = null;

const urlList = ref<string[]>([]);

const displayedResults = computed(() => {
  return crawlResults.value.slice(0, 5);
});

const showCountdown = computed(() => remainingTime.value > 0);

onMounted(async () => {
  urlList.value = [
    'https://www.google.com',
    'https://www.docker.com',
    'https://nodejs.org',
    'https://openai.com',
    'https://www.microsoft.com',
    'https://www.apple.com',
    'https://www.amazon.com',
    'https://www.facebook.com',
    'https://www.twitter.com',
    'https://www.linkedin.com',
    'https://www.youtube.com',
    'https://www.instagram.com',
    'https://www.tiktok.com',
    'https://www.pinterest.com',
    'https://www.reddit.com',
    'https://www.quora.com',
    'https://www.snapchat.com',
    'https://www.spotify.com',
    'https://www.netflix.com',
    'https://www.baidu.com',
    'https://www.qq.com',
    'https://www.weibo.com',
    'https://www.zhihu.com',
    'https://www.douban.com',
    'https://www.jd.com',
    'https://www.taobao.com',
    'https://www.tmall.com',
    'https://www.bytedance.com',
    'https://www.tencent.com',
    'https://www.alibaba.com',
    'https://www.baidu.com',
    'https://www.qq.com',
    'https://www.weibo.com',
    'https://www.zhihu.com',
    'https://www.douban.com',
    'https://www.jd.com',
    // ... 继续添加更多 URL，直到达到 100 个
  ];
  crawlProgress.value = 0;
});

const aiStreamContent = ref('');
const aiStreamContentRef = ref<HTMLElement | null>(null);

// 监听 aiStreamContent 的变化，滚动到底部
watch(aiStreamContent, async () => {
  await nextTick();
  if (aiStreamContentRef.value) {
    aiStreamContentRef.value.scrollTop = aiStreamContentRef.value.scrollHeight;
  }
});

const updateAll = ref(false);

const startCrawl = async () => {
  isCrawling.value = true;
  shouldStopCrawling.value = false;
  crawlResults.value = [];
  crawlProgress.value = 0;
  statusText.value = '';

  try {
    const result = await checkModelSettings(
      await getStoredAiModelProvider(),
      await getStoredCustomModelUrl(),
      await getStoredModelKey(),
      await getStoredAiModelType()
    );
    if (!result) {
      errorMessage({ content: i18.t('options.model.modelSettingsCheckFailed'), position: 'top' });
      return;
    }else{
      successMessage({ content: i18.t('options.model.modelSettingsCheckSuccess'), position: 'top' });
    }
  } catch (error: any) {
    errorMessage({ content: error.message, position: 'top' });
    return;
  }

  
  

  try {
    for (let i = 0; i < urlList.value.length && !shouldStopCrawling.value; i++) {

      const currentUrl = urlList.value[i];

      try {
        if (!updateAll.value) {
          // 只有在不更新所有数据时才检查现有结果
          const existingResult = await getChatCrawlResult(currentUrl);
          if (existingResult) {
            console.log('数据库中已有结果', existingResult);
            crawlResults.value.unshift({
              id: Date.now(),
              title: existingResult.crawlData?.title || '',
              url: currentUrl,
              status: existingResult.status
            });
            if (existingResult.status === 'finished') {
              crawlProgress.value = parseFloat(((i + 1) / urlList.value.length).toFixed(2));
              continue;
            }
          }
        }

        const canCrawl = await incrementCrawlCount();

        if (canCrawl) {

          const result = await chatCrawl(currentUrl, 'bookmarks', (chatCrawlResult: ChatCrawlResult) => {
            const existingIndex = crawlResults.value.findIndex(result => result.url === currentUrl);
            
            if (existingIndex !== -1) {
              // 更新现有结果
              crawlResults.value[existingIndex] = {
                ...crawlResults.value[existingIndex],
                title: chatCrawlResult.chatData?.title?.translated || chatCrawlResult.crawlData?.title || crawlResults.value[existingIndex].title,
                status: chatCrawlResult.status
              };
            } else {
              // 插入新结果
              crawlResults.value.unshift({
                id: Date.now(),
                title: chatCrawlResult.chatData?.title?.translated || chatCrawlResult.crawlData?.title || i18.t('options.crawl.crawlingResultTitle'),
                url: currentUrl,
                status: chatCrawlResult.status
              });
            }
            
            console.log('chatCrawl 结果', chatCrawlResult);
          });

          // 处理 aiStream
          if (result.aiStream) {
            aiStreamContent.value = ''; // 清空之前的内容
            const reader = result.aiStream.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value instanceof Uint8Array) {
                const text = new TextDecoder().decode(value);
                aiStreamContent.value += text;
              } else if (typeof value === 'string') {
                aiStreamContent.value += value;
              }
              // 在每次更新内容后手动触发滚动
              if (aiStreamContentRef.value) {
                aiStreamContentRef.value.scrollTop = aiStreamContentRef.value.scrollHeight;
              }
            }
          }

          crawlProgress.value = parseFloat(((i + 1) / urlList.value.length).toFixed(2));
        } else {
          const resetTime = await getCrawlLimitResetTime();
          startCountdown(resetTime - Date.now());
          await new Promise(resolve => setTimeout(resolve, resetTime - Date.now()));
          i--; // 重试当前URL
        }
      } catch (error) {
        errorMessage({ content: i18.t('options.crawl.crawlError'), position: 'top' });
        console.log('error', error);
        break;
      }

      // 在每次循环迭代结束时检查是否应该停止
      if (shouldStopCrawling.value) {
        break;
      }
    }
    crawlResults.value = crawlResults.value.slice(0, 5);
    successMessage({ content: i18.t('options.crawl.crawlComplete'), position: 'top' });
  } catch (error) {
    errorMessage({ content: i18.t('options.crawl.crawlError'), position: 'top' });
  } finally {
    isCrawling.value = false;
    stopCountdown();
  }
};

const stopCrawl = () => {
  shouldStopCrawling.value = true;
  isCrawling.value = false;
  stopCountdown();
  statusText.value = i18.t('options.crawl.crawlStopped');
  infoMessage({ content: i18.t('options.crawl.crawlStopped'), position: 'top' });
};

const startCountdown = (duration: number) => {
  const endTime = Date.now() + duration;
  const updateTimer = () => {
    const now = Date.now();
    if (now < endTime) {
      remainingTime.value = Math.ceil((endTime - now) / 1000);
      timerProgress.value = (endTime - now) / duration;
      timer = requestAnimationFrame(updateTimer);
    } else {
      stopCountdown();
    }
  };
  updateTimer();
};

const stopCountdown = () => {
  if (timer !== null) {
    cancelAnimationFrame(timer);
    timer = null;
  }
  timerProgress.value = 0;
  remainingTime.value = 0;
};

onUnmounted(() => {
  shouldStopCrawling.value = true;
  stopCountdown();
});

const isDarkMode = ref(false);

onMounted(() => {
  isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
});

const getTitleStyle = (index: number) => {
  const colors = isDarkMode.value
    ? ['#4096ff', '#95de64', '#ffd666']
    : ['#1677ff', '#52c41a', '#faad14'];
  return {
    color: colors[index % colors.length],
    marginBottom: '8px',
    fontSize: '18px',
    fontWeight: '500'
  };
};

const getStatusClass = (status: string) => {
  return status === 'finished' ? 'status-green' : status === 'crawled' ? 'status-orange' : 'status-gray';
};
</script>

<style scoped>
.crawl-container {
  display: flex;
  flex-direction: column;
}

.crawl-h1 {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
}

.content-container {
  display: flex;
  gap: 20px;
}

.crawl-left,
.crawl-right {
  flex: 1;
  max-width: 50%;
}

.crawl-card {
  margin-bottom: 20px;
}

.ai-stream-card {
  position: sticky;
  top: 20px;
  height: calc(100vh - 155px);
  display: flex;
  flex-direction: column;
}

.ai-stream-title {
  margin-bottom: 8px;
}

.ai-stream-container {
  height: calc(100vh - 230px);
  flex-grow: 1;
  overflow-y: auto;
  background-color: var(--color-fill-1);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.ai-stream-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-1);
  margin: 0;
  flex-grow: 1;
  overflow-y: auto;
  padding-bottom: 20px;
  max-height: calc(100vh);
}

.ai-stream-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 340px;
}

.results-container {
  max-height: 500px;
  overflow-y: auto;
  min-height: 315px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-fill-2);
  border-radius: 4px;
  padding: 10px 15px;
  margin-top: 10px;
}

.result-info {
  display: flex;
  align-items: center;
  flex-grow: 1;
  overflow: hidden;
}

.result-title {
  flex: 2;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px;
}

.result-url {
  flex: 3;
  color: var(--color-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-left: 10px;
}

.status-green {
  background-color: #52c41a;
}

.status-orange {
  background-color: #faad14;
}

.status-gray {
  background-color: #d9d9d9;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@media (prefers-color-scheme: light) {
  .crawl-h1 {
    color: #1d1d1d;
  }
}

@media (prefers-color-scheme: dark) {
  .crawl-h1 {
    color: #f0f0f0;
  }
}

.results-placeholder {
  text-align: center;
  padding: 20px;
  color: var(--color-text-3);
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 315px;
}

.countdown-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.results-container :deep(.arco-progress-line) {
  height: 16px !important;
}

.results-container :deep(.arco-progress-line-text) {
  font-size: 14px;
}

.rate-limit-hint {
  font-size: 14px;
  color: var(--color-text-3);
  margin-bottom: 10px;
  text-align: center;
  max-width: 200px;
}

.control-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.control-left {
  flex: 1;
}

.control-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 50px;
  margin-right: 50px;
}

.rate-limit-container {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.rate-limit-text {
  font-size: 14px;
  color: var(--color-text-2);
  margin-right: 4px;
}

.rate-limit-icon {
  color: var(--color-text-3);
  cursor: pointer;
}

@media (max-width: 1200px) {
  .content-container {
    flex-direction: column;
  }

  .crawl-left,
  .crawl-right {
    max-width: 100%;
  }

  .ai-stream-card {
    position: static;
    height: auto;
  }
}

.update-mode {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.update-mode>div:first-child {
  margin-bottom: 5px;
}

.update-mode-description {
  font-size: 14px;
  color: var(--color-text-3);
  margin-bottom: 15px;
}

.control-left :deep(.arco-switch) {
  margin-right: 10px;
}
</style>