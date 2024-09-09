<template>
  <div class="popup-container">
    <div class="search-container">
      <Input v-model="searchKeyword" :placeholder="$t('popup.search.placeholder')" allow-clear @focus="onSearchFocus"
        @blur="onSearchBlur">
      <template #prefix>
        <IconSearch />
      </template>
      </Input>
      <div v-if="!isSearching">
        <h3>{{ $t('popup.topRecords') }}</h3>
        <div class="content-block">
          <div v-for="item in searchResults.slice(0, 10)" :key="item.id" class="result-item" tabindex="0"
            @click="openUrl(item.url)">
            <div class="item-icon" :style="{ backgroundColor: item.color }">
              {{ item.icon }}
            </div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-type">{{ item.type }}</div>
            </div>
            <div class="item-status" :class="{ 'active': item.status === 'active' }"></div>
          </div>
        </div>
        <h3>{{ $t('popup.recentRecords') }}</h3>
        <div class="content-block">
          <div v-for="item in searchResults.slice(0, 10)" :key="item.id" class="result-item" tabindex="0"
            @click="openUrl(item.url)">
            <div class="item-icon" :style="{ backgroundColor: item.color }">
              {{ item.icon }}
            </div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-type">{{ item.type }}</div>
            </div>
            <div class="item-status" :class="{ 'active': item.status === 'active' }"></div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="history-container">
          <Button v-for="keyword in searchHistory" :key="keyword" @click="searchKeyword = keyword" type="text"
            size="mini" class="history-keyword">
            {{ keyword }}
          </Button>
          <Button v-if="searchHistory.length" type="text" size="mini" class="clear-history" @click="clearHistory">
            <IconClose />
          </Button>
        </div>

        <h3>{{ $t('popup.searchResults') }}</h3>
        <div class="content-block">
          <div v-for="item in filteredResults" :key="item.id" class="result-item" tabindex="0"
            @click="openUrl(item.url)">
            <div class="item-icon" :style="{ backgroundColor: item.color }">
              {{ item.icon }}
            </div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-type">{{ item.type }}</div>
            </div>
            <div class="item-status" :class="{ 'active': item.status === 'active' }"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="fixed-button-container">
      <Button class="home-button" @click="openPage('src/home.html')" type="text" status="success">{{ $t('popup.homeButton')
        }}</Button>
      <Button class="home-button" @click="openPage('src/option.html')" type="text" status="success">{{ $t('popup.optionButton')
        }}</Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { Input, Button } from '@arco-design/web-vue';
import { IconSearch, IconClose } from '@arco-design/web-vue/es/icon';
import { useLocale } from '../hooks/locale';
import browser from 'webextension-polyfill'; // Import the polyfill


const { i18, currentLocale, changeLocale } = useLocale()

// 搜索关键词
const searchKeyword = ref('');

const searchHistory = ref(['Vue', 'React', 'TypeScript', 'LongKey哒哒哒哒是的', '你好呀', 'sql注入']);

const clearHistory = () => {
  searchHistory.value = [];
};

// 模拟最近访问记录
const recentRecords = [
  { id: 1, name: 'Item 1', count: 15 },
  { id: 2, name: 'Item 2', count: 10 },
  { id: 3, name: 'Item 3', count: 8 },
  { id: 4, name: 'Item 4', count: 7 },
  { id: 5, name: 'Item 5', count: 6 },
  { id: 6, name: 'Item 6', count: 5 },
  { id: 7, name: 'Item 7', count: 4 },
  { id: 8, name: 'Item 8', count: 3 },
  { id: 9, name: 'Item 9', count: 2 },
  { id: 10, name: 'Item 10', count: 1 },
];

// 模拟搜索结果
const searchResults = [
  { id: 1, name: 'Item with a very long name that should scroll', type: 'Type A', status: 'active', color: '#ff7d00', icon: 'A', url: 'https://example.com', tags: ['tag1', 'tag2'] },
  { id: 2, name: 'Vue.js', type: 'Framework', status: 'active', color: '#4fc08d', icon: 'V', url: 'https://vuejs.org', tags: ['javascript', 'framework'] },
  { id: 3, name: 'React', type: 'Library', status: 'active', color: '#61dafb', icon: 'R', url: 'https://reactjs.org', tags: ['javascript', 'library'] },
  { id: 4, name: 'Angular', type: 'Framework', status: 'inactive', color: '#dd0031', icon: 'A', url: 'https://angular.io', tags: ['javascript', 'framework'] },
  { id: 5, name: 'TypeScript', type: 'Language', status: 'active', color: '#007acc', icon: 'TS', url: 'https://www.typescriptlang.org', tags: ['javascript', 'language'] },
  { id: 6, name: 'JavaScript', type: 'Language', status: 'active', color: '#f7df1e', icon: 'JS', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', tags: ['language'] },
  { id: 7, name: 'Node.js', type: 'Runtime', status: 'active', color: '#339933', icon: 'N', url: 'https://nodejs.org', tags: ['javascript', 'runtime'] },
  { id: 8, name: 'Python', type: 'Language', status: 'inactive', color: '#3776ab', icon: 'Py', url: 'https://www.python.org', tags: ['language'] },
  { id: 9, name: 'Docker', type: 'Tool', status: 'active', color: '#2496ed', icon: 'D', url: 'https://www.docker.com', tags: ['tool'] },
];

// 默认显示最近访问记录中使用次数最多的前十条记录
const topRecords = computed(() => recentRecords.slice(0, 10));


// 是否在搜索模式
const isSearching = ref(false);

// 根据搜索关键词过滤记录
const filteredResults = computed(() => {
  if (searchKeyword.value === '') {
    return searchResults;
  } else {
    return searchResults.filter(result => result.name.toLowerCase().includes(searchKeyword.value.toLowerCase()));
  }
});

// 处理搜索框点击事件
const onSearchFocus = () => {
  isSearching.value = true;
};

// 处理搜索框失去焦点事件
const onSearchBlur = (event: any) => {
  const relatedTarget = event.relatedTarget;
  if (relatedTarget && (relatedTarget.classList.contains('history-keyword') ||
    relatedTarget.classList.contains('clear-history') ||
    relatedTarget.classList.contains('result-item'))) {
    return;
  }

  if (searchKeyword.value === '') {
    isSearching.value = false;
  }
};

// 打开URL
const openUrl = (url: string) => {
  window.open(url, '_blank');
};

const openPage = (url: string) => {
  const fullUrl = browser.runtime.getURL(url);

  browser.tabs.create({ url: fullUrl }).catch(e => console.error('Error opening tab:', e));
};

onMounted(() => {
  document.title = i18.t('popup.title');
})
</script>

<style scoped>
.popup-container {
  width: 300px;
  padding: 16px;
  border-radius: 8px;
  overflow-y: auto;
  /* 使内容块可以上下滚动 */
  position: relative;
  /* 确保按钮相对于容器定位 */
}

.search-container {
  margin-bottom: 16px;
  padding-bottom: 30px;
}

.history-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
  margin-bottom: 8px;
}

.history-keyword {
  color: #999 !important;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  /* 添加这行 */
}

.content-block {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  background-color: #f5f5f5;
  transition: transform 0.3s ease;
  overflow: hidden;
}

.result-item:hover {
  transform: scale(1.05);
}

.result-item:hover .item-name {
  overflow: visible;
  /* 鼠标悬停时显示完整文本 */
  position: relative;
  animation: scroll-text 10s linear infinite;
}

.item-icon {
  width: 32px;
  height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  margin-right: 8px;
  font-size: 0.9em;
}

.item-info {
  flex-grow: 1;
  overflow: hidden;
  min-width: 0;
  /* 添加这行确保容器不限制内容宽度 */
}

.item-name {
  max-width: 90%;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  font-size: 0.9em;
}

.item-type {
  font-size: 0.8em;
  color: #666;
}

.item-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #bbb;
  flex-shrink: 0;
}

.item-status.active {
  background-color: #52c41a;
}

@keyframes scroll-text {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-100%);
  }
}

.clear-history {
  color: #f5222d !important;
  padding: 0 4px;
}

.fixed-button-container {
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 300px; /* Adjust the width as necessary */
  padding: 5px;
  background-color: rgba(255, 255, 255, 0.8); /* Semi-transparent white background */
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  opacity: 0;
  animation: fadeIn 1s forwards;
}

.text-button {
  font-size: 18px;
  color: #333; /* Dark text for visibility */
  transition: color 0.3s ease;
}

.text-button:hover {
  color: #555; /* Darken text on hover for better interaction feedback */
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
