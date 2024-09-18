<template>
  <Layout class="layout">
    <div class="menu-demo" :class="{ 'menu-collapsed': isCollapsed }">
      <Menu mode="pop" showCollapseButton :collapsed="isCollapsed" :default-selected-keys="['1']"
        @menu-item-click="onMenuItemClick" @collapse="onCollapse" class="centered-menu">
        <MenuItem key="1">
        <template #icon>
          <IconSettings />
        </template>
        {{ i18.t('options.plugin.title') }}
        </MenuItem>
        <MenuItem key="2">
        <template #icon>
          <IconRobot />
        </template>
        {{ i18.t('options.model.title') }}
        </MenuItem>
        <MenuItem key="3">
        <template #icon>
          <IconBug />
        </template>
        {{ i18.t('options.crawl.title') }}
        </MenuItem>
      </Menu>
    </div>
    <Layout>
      <Content :class="{ 'content-collapsed': isCollapsed }">
        <Card :bordered="false" :style="{ height: '100%' }" class="content-card">
          <component :is="currentComponent" />
        </Card>
      </Content>
    </Layout>
  </Layout>
</template>

<script lang="ts" setup>
import { ref, computed, markRaw, onMounted } from 'vue';
import { useLocale } from '../utils/locale';
import {
  Layout,
  Menu,
  Card,
  Typography
} from '@arco-design/web-vue';
import {
  IconSettings,
  IconRobot,
  IconBug
} from '@arco-design/web-vue/es/icon';
import Setting from './Options/Setting.vue';
import Models from './Options/Models.vue';
import Crawl from './Options/Crawl.vue';

const { Content } = Layout;
const { Item: MenuItem } = Menu;

const { i18 } = useLocale();

const isDarkMode = ref(false);
const currentSection = ref('1');
const isCollapsed = ref(false);

const currentTitle = computed(() => {
  switch (currentSection.value) {
    case '1': return i18.t('options.plugin.title');
    case '2': return i18.t('options.model.title');
    case '3': return i18.t('options.crawl.title');
    default: return '';
  }
});

const currentComponent = computed(() => {
  switch (currentSection.value) {
    case '1': return markRaw(Setting);
    case '2': return markRaw(Models);
    case '3': return markRaw(Crawl);
    default: return null;
  }
});

const onMenuItemClick = (key: string) => {
  currentSection.value = key;
};

const onCollapse = (collapsed: boolean) => {
  isCollapsed.value = collapsed;
};

onMounted(() => {
  isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  updateTheme();
});

const updateTheme = () => {
  if (isDarkMode.value) {
    document.body.setAttribute('arco-theme', 'dark');
  } else {
    document.body.removeAttribute('arco-theme');
  }
};

</script>

<style scoped>
.layout {
  height: 100vh;
  position: relative;
  background-color: var(--color-bg-1);
}

.menu-demo {
  position: absolute;
  left: 20px;
  top: 40px;
  bottom: 40px;
  z-index: 1;
  transition: all 0.2s;
}

.menu-demo.menu-collapsed {
  /* left: 20px; */
  top: 50%;
  transform: translateY(-50%);
}

.menu-demo :deep(.arco-menu) {
  width: 200px;
  height: calc(100vh - 80px);
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.1);
  background-color: var(--color-bg-2);
  transition: all 0.2s;
  border-radius: 10px;
  /* 添加圆角 */
}

.menu-demo :deep(.arco-menu-collapse-button) {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  right: -16px;
  /* 将按钮移到菜单外部 */
  z-index: 1;
  /* 确保按钮在菜单上方 */
}

.menu-demo :deep(.arco-menu:not(.arco-menu-collapsed) .arco-menu-collapse-button) {
  bottom: 8px;
  transform: translateX(0);
  /* 移除之前的平移 */
}

.menu-demo :deep(.arco-menu:not(.arco-menu-collapsed))::before {
  content: '';
  position: absolute;
  right: -24px;
  /* 调整位置以适应新的按钮位置 */
  bottom: 0;
  width: 48px;
  height: 48px;
  background-color: inherit;
  border-radius: 50%;
  box-shadow: -4px 0 2px var(--color-bg-2), 0 0 1px rgba(0, 0, 0, 0.3);
}

.menu-demo :deep(.arco-menu.arco-menu-collapsed) {
  width: 48px;
  height: auto;
  padding-top: 24px;
  padding-bottom: 138px;
  border-radius: 22px;
}

.menu-demo :deep(.arco-menu.arco-menu-collapsed .arco-menu-collapse-button) {
  right: 8px;
  /* 折叠时将按钮放回菜单内部 */
  bottom: 16px;
}

.arco-layout-content {
  padding: 16px 16px 16px 256px;
  background: var(--color-fill-2);
  transition: padding 0.2s;
}

.arco-layout-content.content-collapsed {
  padding-left: 84px;
}

.content-card {
  height: 95%;
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-bg-2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.content-card :deep(.arco-card-header) {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.content-card :deep(.arco-card-body) {
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.arco-card {
  height: 100%;
}

.centered-menu :deep(.arco-menu-inner) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.menu-demo :deep(.arco-menu.arco-menu-collapsed) {
  padding-top: 40px;
  padding-bottom: 60px;
}

.menu-demo :deep(.arco-menu.arco-menu-collapsed .arco-menu-collapse-button) {
  bottom: 16px;
}
</style>