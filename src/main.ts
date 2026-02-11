import { createPinia } from "pinia";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import { routes } from "./router";
import { useSettingsStore } from "./stores/settings";

import "./assets/main.css";

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

// Initialize theme before mounting
const settingsStore = useSettingsStore();
settingsStore.initTheme();

const router = createRouter({
  history: createWebHistory(),
  routes,
});
app.use(router);

app.mount("#app");
