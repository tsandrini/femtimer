<script setup lang="ts">
import {
  SettingsOutline,
  StatsChartOutline,
  TimerOutline,
} from "@vicons/ionicons5";
import {
  type GlobalThemeOverrides,
  NConfigProvider,
  NDialogProvider,
  NIcon,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NMenu,
  NMessageProvider,
  NNotificationProvider,
  darkTheme,
} from "naive-ui";
import { computed, h } from "vue";
import { useRoute, useRouter } from "vue-router";

// Custom theme overrides for Naive UI
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#f98fed",
    primaryColorHover: "#fea1de",
    primaryColorPressed: "#c37ef0",
    primaryColorSuppl: "#de89fd",
  },
  Button: {
    textColorPrimary: "#ffffff",
  },
  Menu: {
    itemTextColorActiveHorizontal: "#f98fed",
    itemTextColorHoverHorizontal: "#fea1de",
    itemIconColorActiveHorizontal: "#f98fed",
    itemIconColorHoverHorizontal: "#fea1de",
  },
  Card: {
    borderRadius: "12px",
  },
};

const router = useRouter();
const route = useRoute();

const menuOptions = [
  {
    label: "Timer",
    key: "timer",
    icon: () => h(NIcon, null, { default: () => h(TimerOutline) }),
  },
  {
    label: "Stats",
    key: "stats",
    icon: () => h(NIcon, null, { default: () => h(StatsChartOutline) }),
  },
  {
    label: "Settings",
    key: "settings",
    icon: () => h(NIcon, null, { default: () => h(SettingsOutline) }),
  },
];

const activeKey = computed(() => route.name as string);

function handleMenuUpdate(key: string) {
  router.push({ name: key });
}
</script>

<template>
  <NConfigProvider :theme="darkTheme" :theme-overrides="themeOverrides">
    <NMessageProvider>
      <NDialogProvider>
        <NNotificationProvider>
          <NLayout class="app-layout">
            <NLayoutHeader bordered class="app-header">
              <div class="header-content">
                <h1 class="app-title">Femtimer</h1>
                <NMenu
                  mode="horizontal"
                  :options="menuOptions"
                  :value="activeKey"
                  @update:value="handleMenuUpdate"
                />
              </div>
            </NLayoutHeader>
            <NLayoutContent class="app-content">
              <RouterView />
            </NLayoutContent>
          </NLayout>
        </NNotificationProvider>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-header {
  padding: 0 24px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-content {
  padding: 24px;
}
</style>
