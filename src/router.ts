import type { RouteRecordRaw } from "vue-router";
import SettingsView from "./views/SettingsView.vue";
import StatsView from "./views/StatsView.vue";
import TimerView from "./views/TimerView.vue";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "timer",
    component: TimerView,
  },
  {
    path: "/stats",
    name: "stats",
    component: StatsView,
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsView,
  },
];
