<template>

</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useLocale } from '../utils/locale';

const { i18, currentLocale, changeLocale } = useLocale();

const isDarkMode = ref(false);

onMounted(() => {
  document.title = i18.t('home.title');
  isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isDarkMode.value) {
    document.body.setAttribute('arco-theme', 'dark');
  } else {
    document.body.removeAttribute('arco-theme');
  }
});

</script>

<style scoped></style>