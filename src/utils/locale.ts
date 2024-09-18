import { computed, onMounted } from 'vue';
import { createI18n, useI18n } from 'vue-i18n';
import enUS from '../locale/en-US'; // 引入语言文件
import zhCN from '../locale/zh-CN';
import ja from '../locale/ja';
import { setStoreLocale, getStoredLocale } from './storage';

const i18n = createI18n({
    legacy: false,
    locale: 'zh-CN', // 设置默认语言
    messages: {
        'zh-CN': zhCN,
        'en-US': enUS, // 添加语言包
        'ja': ja,
    },
});

const localeNameMap: Record<string, string> = {
    'en-US': 'English',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'ja': 'Japanese',
    'es': 'Spanish',
    'ko': 'Korean',
    'th': 'Thai',
    'ms': 'Malay',
    'pt-PT': 'Portuguese',
    'de': 'German',
    'vi': 'Vietnamese',
    'fr': 'French',
    'it': 'Italian',
    'km': 'Khmer',
    'id': 'Indonesian',
    'ar': 'Arabic'
};

export const useLocale = () => {
    const i18 = useI18n(); // 使用 useI18n 钩子

    const currentLocale = computed(() => {
        return i18.locale.value;
    });

    const currentLocaleName = computed(() => {
        return localeNameMap[currentLocale.value];
    });

    const changeLocale = async (value: string) => {
        i18.locale.value = value;
        await setStoreLocale(value);

        if (window.location.pathname.includes('options.html')) {
            document.title = i18.t('options.title');
        } else if (window.location.pathname.includes('home.html')) {
            document.title = i18.t('home.title');
        } else {
            document.title = i18.t('popup.title');
        }
    };

    onMounted(async () => {
        const storedLocale = await getStoredLocale();
        changeLocale(storedLocale);
    });

    return { i18, currentLocale, currentLocaleName, changeLocale };
};

export { i18n };