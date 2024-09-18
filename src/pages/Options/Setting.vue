<template>
  <Space direction="vertical" size="large" fill>
    <h1 class="setting-h1">{{ i18.t('options.plugin.title') }}</h1>

    <Card v-for="(item, index) in settingItems" :key="index" class="setting-item">
      <template #title>
        <h3 :style="getTitleStyle(index)">{{ i18.t(item.title) }}</h3>
      </template>
      <p>{{ i18.t(item.hint) }}</p>
      <component :is="item.component" :modelValue="settings[item.bindKey]"
        :onUpdate:modelValue="(value: any) => settings[item.bindKey] = value" v-if="item.options">
        <component v-for="option in item.options" :key="option.value" :is="item.optionComponent" :value="option.value">
          {{ i18.t(option.label) }}
        </component>
      </component>

      <!-- 对于没有 options 的组件，比如 Switch -->
      <component v-else :is="item.component" :modelValue="settings[item.bindKey]"
        :onUpdate:modelValue="(value: any) => settings[item.bindKey] = value" />
    </Card>
  </Space>
</template>

<script lang="ts" setup>
import { reactive, onMounted, watch, ref } from 'vue';
import { useLocale } from '../../utils/locale';
import { dbService, getStoredLocale, getStoredPopupAction, getStoredEnableScreenshotCache } from '../../utils/storage';
import { Space, Select, Switch, Radio, Card } from '@arco-design/web-vue';
import type { SelectInstance, RadioGroupInstance, SwitchInstance } from '@arco-design/web-vue';

const { i18, currentLocale, changeLocale } = useLocale();
const { Option } = Select;

// 使用 Record<string, any> 类型来允许动态访问 settings 的键
const settings = reactive<Record<string, any>>({
  language: currentLocale.value,
  popupAction: 'search',
  enableScreenshotCache: true,
});

onMounted(async () => {
  settings.language = await getStoredLocale();
  settings.popupAction = await getStoredPopupAction();
  settings.enableScreenshotCache = await getStoredEnableScreenshotCache();
});

const updateLanguage = async (value: string) => {
  settings.language = value;
  changeLocale(value);
  await dbService.updateItem('settings', { id: 'locale', value });
};

const changePopupAction = async (value: string) => {
  settings.popupAction = value;
  await dbService.updateItem('settings', { id: 'popupAction', value });
};

const changeScreenshotCache = async (value: boolean) => {
  settings.enableScreenshotCache = value;
  await dbService.updateItem('settings', { id: 'enableScreenshotCache', value });
};

watch(() => settings.language, updateLanguage);
watch(() => settings.popupAction, changePopupAction);
watch(() => settings.enableScreenshotCache, changeScreenshotCache);

interface SettingItem {
  title: string;
  hint: string;
  component: any;
  bindKey: keyof typeof settings;  // 绑定的键，比如 language, popupAction, enableScreenshotCache
  options?: { value: string; label: string }[];
  optionComponent?: any;
}

const settingItems: SettingItem[] = [
  {
    title: 'options.plugin.language.title',
    hint: 'options.plugin.language.hint',
    component: Select,
    bindKey: 'language',
    options: [
      { value: 'zh-CN', label: 'options.plugin.language.zhCN' },
      { value: 'zh-TW', label: 'options.plugin.language.zhTW' },
      { value: 'en-US', label: 'options.plugin.language.enUS' },
      { value: 'es', label: 'options.plugin.language.es' },
      { value: 'pt-PT', label: 'options.plugin.language.ptPT' },
      { value: 'th', label: 'options.plugin.language.th' },
      { value: 'ja', label: 'options.plugin.language.ja' },
      { value: 'ko', label: 'options.plugin.language.ko' },
      { value: 'it', label: 'options.plugin.language.it' },
      { value: 'ms', label: 'options.plugin.language.ms' },
      { value: 'id', label: 'options.plugin.language.id' },
      { value: 'ar', label: 'options.plugin.language.ar' },
      { value: 'fr', label: 'options.plugin.language.fr' },
      { value: 'de', label: 'options.plugin.language.de' },
      { value: 'vi', label: 'options.plugin.language.vi' },
      { value: 'km', label: 'options.plugin.language.km' },
    ],
    optionComponent: Option,
  },
  {
    title: 'options.plugin.popupAction.title',
    hint: 'options.plugin.popupAction.hint',
    component: Radio.Group,
    bindKey: 'popupAction',
    options: [
      { value: 'search', label: 'options.plugin.popupAction.search' },
      { value: 'newTab', label: 'options.plugin.popupAction.newTab' },
    ],
    optionComponent: Radio,
  },
  {
    title: 'options.plugin.screenshotCache.title',
    hint: 'options.plugin.screenshotCache.hint',
    component: Switch,
    bindKey: 'enableScreenshotCache',
  },
];

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
</script>

<style scoped>
.setting-item {
  margin-bottom: 20px;
  max-width: 600px;
  margin-left: 20px;
}

.setting-item ::v-deep(h3) {
  margin-bottom: 8px;
  font-size: 18px;
}

.setting-title-1 {
  color: var(--color-title-1);
}

.setting-title-2 {
  color: var(--color-title-2);
}

.setting-title-3 {
  color: var(--color-title-3);
}

:root {
  --color-title-1: #1890ff;
  --color-title-2: #52c41a;
  --color-title-3: #faad14;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-title-1: #177ddc;
    --color-title-2: #49aa19;
    --color-title-3: #d89614;
  }
}

.setting-h1 {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  margin-left: 20px;
}

@media (prefers-color-scheme: light) {
  .setting-h1 {
    color: #1d1d1d;
  }
}

@media (prefers-color-scheme: dark) {
  .setting-h1 {
    color: #f0f0f0;
  }
}
</style>