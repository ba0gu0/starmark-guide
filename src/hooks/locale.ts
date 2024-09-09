import { computed } from 'vue';
import { createI18n, useI18n } from 'vue-i18n';
import enUS from '../locale/en-US'; // 引入语言文件
import zhCN from '../locale/zh-CN';

const i18n = createI18n({
    locale: 'zh-CN', // 设置默认语言
    messages: {
        'zh-CN': zhCN,
        'en-US': enUS, // 添加语言包
    },
});

export const useLocale = () => {
    const i18 = useI18n(); // 使用 useI18n 钩子

    const currentLocale = computed(() => {
        return i18.locale.value;
    });

    const changeLocale = (value: string) => {
        i18.locale.value = value;
        localStorage.setItem('arco-locale', value);

        if (window.location.pathname.includes('options.html')) {
            document.title = i18.t('options.title');
        } else if (window.location.pathname.includes('home.html')) {
            document.title = i18.t('home.title');
        } else {
            document.title = i18.t('popup.title');
        }
    };

    return { i18, currentLocale, changeLocale };
};

export { i18n };