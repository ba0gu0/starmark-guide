import { createApp } from "vue";
import ArcoVue from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';
import Options from "./pages/Options.vue";
import { i18n } from './hooks/locale'

const app = createApp(Options);
app.use(ArcoVue);

app.use(i18n); // 使用 i18n 实例

app.mount("body");

const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");

darkThemeMq.addEventListener('change', e => {
  if (e.matches) {
    document.body.setAttribute('arco-theme', 'dark');
  } else {
    document.body.removeAttribute('arco-theme');
  }
});
