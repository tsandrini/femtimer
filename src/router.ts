import type { RouteRecordRaw } from "vue-router";
import SettingsView from "./views/SettingsView.vue";
import TimerView from "./views/TimerView.vue";
import WidgetTestView from "./views/WidgetTestView.vue";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "timer",
    component: TimerView,
  },
  {
    path: "/page/:pageId",
    name: "page",
    component: () => import("./views/PageView.vue"),
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsView,
  },
  {
    path: "/test-widgets",
    name: "widget-test",
    component: WidgetTestView,
  },
];
