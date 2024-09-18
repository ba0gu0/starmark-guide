import { createApp } from "vue";
import ArcoVue from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';
import Popup from "./pages/Popup.vue";
import { i18n } from './utils/locale'

const app = createApp(Popup);
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


