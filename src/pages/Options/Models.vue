<template>
  <Space direction="vertical" size="large" fill>
    <h1 class="setting-h1">{{ i18.t('options.model.title') }}</h1>

    <div class="card-container">
      <!-- 左侧卡片 -->
      <Card class="setting-item left-card">
        <template #title>
          <h3 :style="getTitleStyle(0)">{{ i18.t('options.model.title') }}</h3>
        </template>

        <!-- AI 模型厂商选择 -->
        <p>{{ i18.t('options.model.aiModelProviderHint') }}</p>
        <Select v-model="settings.aiModelProvider" style="width: 100%" @change="onProviderChange">
          <Option v-for="option in modelProviderOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </Option>
        </Select>

        <!-- AI 模型类型选择 -->
        <p>{{ i18.t('options.model.aiModelTypeHint') }}</p>
        <Select v-model="settings.aiModelType" style="width: 100%" @change="onModelTypeChange">
          <Option v-for="option in modelTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </Option>
        </Select>

        <!-- 自定义模型 URL -->
        <p>{{ i18.t('options.model.customModelUrlHint') }}</p>
        <Input v-model="settings.customModelUrl" :placeholder="defaultModelUrl" style="margin-top: 10px;"
          @change="onCustomModelUrlChange" />

        <!-- 模型 API 密钥 -->
        <p>{{ i18.t('options.model.modelKeyHint') }}</p>
        <InputPassword v-model="settings.modelKey" :placeholder="i18.t('options.model.modelKeyPlaceholder')"
          style="margin-top: 10px;" @change="onModelKeyChange" />

        <!-- 检查按钮 -->
        <Button @click="checkModel" style="margin-top: 30px;" type="outline" status="success">{{
          i18.t('options.model.checkModelSettings') }}</Button>
      </Card>

      <!-- 右侧卡片容器 -->
      <div class="right-cards">
        <!-- 独立 API 密钥设置 -->
        <Card v-for="(item, index) in keyItems" :key="index" class="setting-item right-card">
          <template #title>
            <h3 :style="getTitleStyle(index + 1)">{{ i18.t(item.title) }}</h3>
          </template>
          <p>{{ i18.t(item.hint) }}</p>
          <InputPassword v-model="settings[item.bindKey]" :placeholder="i18.t(item.placeholder || '')"
            @change="item.onKeyChange" />
          <!-- 检查按钮 -->
          <Button @click="item.checkFunction" style="margin-top: 30px;" type="outline" status="success">{{
            i18.t('options.model.checkModelSettings') }}</Button>
        </Card>
      </div>
    </div>
  </Space>
</template>

<script lang="ts" setup>
import { reactive, onMounted, computed, ref } from 'vue';
import { checkFirecrawlKey } from '../../utils/firecrawl';
import { checkJinaAIKey } from '../../utils/jinaai';

import { useLocale } from '../../utils/locale';
import {
  getStoredAiModelProvider,
  getStoredAiModelType,
  getStoredCustomModelUrl,
  getStoredModelKey,
  getStoredJinaKey,
  getStoredFirecrawlKey,
  setStoreAiModelProvider,
  setStoreAiModelType,
  setStoreCustomModelUrl,
  setStoreModelKey,
  setStoreJinaKey,
  setStoreFirecrawlKey
} from '../../utils/storage';
import { checkModelSettings, modelProviderOptions, getModelTypeOptions, getOllamaModels } from '../../utils/models';
import { Space, Select, Input, Card, Button, Message } from '@arco-design/web-vue';

const { i18 } = useLocale();
const { Option } = Select;
const { Password: InputPassword } = Input;
const { info: infoMessage, error: errorMessage, success: successMessage, warning: warningMessage } = Message;

const settings = reactive({
  aiModelProvider: '',
  aiModelType: '',
  customModelUrl: '',
  modelKey: '',
  jinaKey: '',
  firecrawlKey: '',
});

type SettingsKey = keyof typeof settings;

onMounted(async () => {
  settings.aiModelProvider = await getStoredAiModelProvider();
  settings.aiModelType = await getStoredAiModelType();
  settings.customModelUrl = await getStoredCustomModelUrl();
  settings.modelKey = await getStoredModelKey();
  settings.jinaKey = await getStoredJinaKey();
  settings.firecrawlKey = await getStoredFirecrawlKey();
  if (settings.aiModelProvider === 'ollama') {
    modelTypeOptionsData.value = await getOllamaModels(defaultModelUrl.value);
  }else{
    modelTypeOptionsData.value = getModelTypeOptions(settings.aiModelProvider);
  }
});

const updateSetting = async (key: SettingsKey, value: string) => {
  settings[key] = value;

  
  
  switch (key) {
    case 'aiModelProvider':
      await setStoreAiModelProvider(value);
      await setStoreCustomModelUrl(settings.customModelUrl);
      await setStoreAiModelType(settings.aiModelType);
      break;
    case 'aiModelType':
      await setStoreAiModelType(value);
      break;
    case 'customModelUrl':
      await setStoreCustomModelUrl(value);
      break;
    case 'modelKey':
      await setStoreModelKey(value);
      break;
    case 'jinaKey':
      await setStoreJinaKey(value);
      break;
    case 'firecrawlKey':
      await setStoreFirecrawlKey(value);
      break;
  }
};

const modelTypeOptionsData = ref(getModelTypeOptions(settings.aiModelProvider));

const modelTypeOptions = computed(() => {
  const options = [...modelTypeOptionsData.value];
  const selectedIndex = options.findIndex(option => option.value === settings.aiModelType);
  if (selectedIndex > 0) {
    const [selectedOption] = options.splice(selectedIndex, 1);
    options.unshift(selectedOption);
  }
  return options;
});

const defaultModelUrl = computed(() => {
  return modelProviderOptions.find(option => option.value === settings.aiModelProvider)?.apiUrl || '';
});

const onProviderChange = async () => {
  if (settings.aiModelProvider === 'ollama') {
    modelTypeOptionsData.value = await getOllamaModels(defaultModelUrl.value);
  }else{
    modelTypeOptionsData.value = getModelTypeOptions(settings.aiModelProvider);
  }
  settings.customModelUrl = defaultModelUrl.value;
  settings.aiModelType = modelTypeOptionsData.value[0].value;
  updateSetting('aiModelProvider', settings.aiModelProvider);
};

const onModelTypeChange = () => {
  updateSetting('aiModelType', settings.aiModelType);
};

const onModelKeyChange = () => {
  updateSetting('modelKey', settings.modelKey);
};

const onCustomModelUrlChange = () => {
  updateSetting('customModelUrl', settings.customModelUrl);
};

const checkModel = async () => {
  try {
    const result = await checkModelSettings(
      settings.aiModelProvider,
      settings.customModelUrl || defaultModelUrl.value,
      settings.modelKey,
      settings.aiModelType
    );
    if (result) {
      successMessage({ content: i18.t('options.model.modelSettingsCheckSuccess'), position: 'top' });
    } else {
      errorMessage({ content: i18.t('options.model.modelSettingsCheckFailed'), position: 'top' });
    }
  } catch (error: any) {
    errorMessage({ content: error.message, position: 'top' });
  }
};

const keyItems = [
  {
    title: 'options.model.jinaKey.title',
    hint: 'options.model.jinaKey.hint',
    bindKey: 'jinaKey' as SettingsKey,
    placeholder: 'options.model.jinaKey.placeholder',
    onKeyChange: () => {
      updateSetting('jinaKey', settings.jinaKey);
    },
    checkFunction: async () => {
      const result = await checkJinaAIKey(settings.jinaKey);
      if (result) {
        successMessage({ content: i18.t('options.model.jinaKey.checkSuccess'), position: 'top' });
      } else {
        errorMessage({ content: i18.t('options.model.jinaKey.checkFailed'), position: 'top' });
      }
    }
  },
  {
    title: 'options.model.firecrawlKey.title',
    hint: 'options.model.firecrawlKey.hint',
    bindKey: 'firecrawlKey' as SettingsKey,
    placeholder: 'options.model.firecrawlKey.placeholder',
    onKeyChange: () => {
      updateSetting('firecrawlKey', settings.firecrawlKey);
    },
    checkFunction: async () => {
      const result = await checkFirecrawlKey(settings.firecrawlKey);
      if (result) {
        successMessage({ content: i18.t('options.model.firecrawlKey.checkSuccess'), position: 'top' });
      } else {
        errorMessage({ content: i18.t('options.model.firecrawlKey.checkFailed'), position: 'top' });
      }
    }
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

.card-container {
  display: flex;
  gap: 20px;
  margin-left: 20px;
}

.setting-item {
  margin-bottom: 20px;
}

.left-card {
  flex: 1;
  max-width: 600px;
}

.right-cards {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.right-card {
  flex: 1;
}

.setting-item :deep(h3) {
  margin-bottom: 8px;
  font-size: 18px;
}

.setting-item p {
  margin-bottom: 12px;
  color: var(--color-text-3);
}
</style>
