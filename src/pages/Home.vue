<template>

</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useLocale } from '../hooks/locale';

const { i18, currentLocale, changeLocale } = useLocale();

onMounted(() => {
  document.title = i18.t('home.title');
});
</script>

<style scoped>

</style>