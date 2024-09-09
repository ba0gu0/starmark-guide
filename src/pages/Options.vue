<template>
  <div>
    <Input v-model="apiKey" placeholder="Enter API Key"></Input>
    <Input v-model="urls" placeholder="Enter URLs (comma separated)"></Input>
    <Button type="primary" @click="startCrawl">Start Crawl</Button>
    <Button type="primary" @click="continueCrawl">Continue Crawl</Button>
    <div v-if="currentTask && currentTask.success">
      <h3>{{ currentTask.title }}</h3>
      <p>{{ currentTask.description }}</p>
      <p>{{ currentTask.language }}</p>
      <p>{{ currentTask.sourceURL }}</p>
    </div>
    <Progress size="large" :percent="progress" :color="{
      '0%': 'rgb(var(--primary-6))',
      '100%': 'rgb(var(--success-6))',
    }" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useLocale } from '../hooks/locale';
import { initializeFirecrawl, scrapeUrl } from '../hooks/firecrawl';
import { Input, Button, Progress, Notification } from '@arco-design/web-vue';

interface Task {
  title?: string;
  description?: string;
  language?: string;
  sourceURL: string;
  success: boolean;
}

const { i18, currentLocale, changeLocale } = useLocale();

const apiKey = ref<string>('this_is_just_a_preview_token');

const urls = ref<string>(`
https://google.com, https://microsoft.com, https://apple.com, https://facebook.com, 
https://amazon.com, https://ibm.com, https://intel.com, https://cisco.com, https://oracle.com,
https://sap.com, https://delltechnologies.com, https://hpe.com, https://salesforce.com, https://twitter.com,
https://adobe.com, https://vmware.com, https://paypal.com, https://squareup.com, https://linkedin.com, 
https://uber.com, https://airbnb.com, https://netflix.com, https://tesla.com, https://samsung.com, 
https://sony.com, https://panasonic.com, https://nvidia.com, https://amd.com, https://github.com, 
https://xiaomi.com, https://huawei.com, https://alibaba.com, https://tencent.com, https://baidu.com, 
https://zoom.us, https://reddit.com, https://spotify.com, https://ebay.com, https://yahoo.com, 
https://etsy.com, https://shopify.com, https://snapchat.com, https://dropbox.com, https://asus.com,
https://mozilla.org, https://wordpress.org, https://wework.com, https://twitch.tv, https://stripe.com,
https://epicgames.com
`);
const currentTask = ref<Task | null>(null);
const progress = ref<number>(0);
const tasks = ref<string[]>([]);
const taskIndex = ref<number>(0);
const lastRunTime = ref<number>(0);
const maxTasksPerMinute = 5;
const rateLimitPeriod = 60000; // milliseconds

const startCrawl = async () => {
  const urlList: string[] = urls.value.split(',').map(url => url.trim());
  tasks.value = urlList;
  taskIndex.value = 0;
  lastRunTime.value = Date.now();
  await processTasks();
};

const processTasks = async () => {
  for (let i = 0; i < maxTasksPerMinute && taskIndex.value < tasks.value.length; i++, taskIndex.value++) {
    console.log(`Processing task ${taskIndex.value + 1}/${tasks.value.length}`);
    const url = tasks.value[taskIndex.value];
    await initializeFirecrawl(apiKey.value);
    const result = await scrapeUrl(url);
    if (result.success && result.metadata) {
      currentTask.value = {
        title: result.metadata.title,
        description: result.metadata.description,
        language: result.metadata.language,
        sourceURL: url,
        success: true
      };
    } else {
      console.log('爬取失败', result)
      Notification.warning({
        title: '爬取失败',
        content: `错误信息: ${result.error || (result.warning || '未知错误')}`
      });
    }
    progress.value = (taskIndex.value + 1) / tasks.value.length;

    if ((Date.now() - lastRunTime.value) >= rateLimitPeriod) {

      break;
    }
  }
  if (taskIndex.value < tasks.value.length) {

    Notification.info({
      title: 'Rate Limit Hit',
      content: 'You have hit the rate limit. Please wait to continue.'
    });
  }
};

const continueCrawl = async () => {
  const now = Date.now();
  if (now - lastRunTime.value < rateLimitPeriod) {

    Notification.warning({
      title: 'Wait',
      content: 'Please wait until the rate limit period passes before continuing.'
    });
    return;
  }
  lastRunTime.value = Date.now()

  await processTasks();
};

onMounted(() => {
  document.title = i18.t('option.title');
});
</script>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  margin: auto;
  padding: 20px;
}
</style>