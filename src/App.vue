<script setup lang="ts">
import { usePagesStore } from "@/stores/pages";
import {
  AddOutline,
  DocumentsOutline,
  SettingsOutline,
  TimerOutline,
} from "@vicons/ionicons5";
import {
  type GlobalThemeOverrides,
  NButton,
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
import { computed, h, onMounted } from "vue";
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
const pagesStore = usePagesStore();

onMounted(async () => {
  await pagesStore.loadPages();
});

const menuOptions = computed(() => [
  {
    label: "Timer",
    key: "timer",
    icon: () => h(NIcon, null, { default: () => h(TimerOutline) }),
  },
  {
    label: "Pages",
    key: "pages",
    icon: () => h(NIcon, null, { default: () => h(DocumentsOutline) }),
    children: [
      ...pagesStore.userPages.map((page) => ({
        label: page.name,
        key: `page-${page.id}`,
      })),
      ...(pagesStore.userPages.length > 0
        ? [{ type: "divider" as const, key: "divider" }]
        : []),
      {
        label: () =>
          h(
            "span",
            { style: { display: "flex", alignItems: "center", gap: "6px" } },
            [
              h(NIcon, { size: 16 }, { default: () => h(AddOutline) }),
              "Create Page",
            ],
          ),
        key: "create-page",
      },
    ],
  },
]);

const activeKey = computed(() => {
  const name = route.name as string;
  // Handle page routes
  if (name === "page") {
    return `page-${route.params.pageId}`;
  }
  return name;
});

async function handleMenuUpdate(key: string) {
  if (key === "create-page") {
    const page = await pagesStore.createPage("New Page");
    router.push({
      name: "page",
      params: { pageId: page.id },
      query: { edit: "true" },
    });
    return;
  }
  if (key.startsWith("page-")) {
    const pageId = key.replace("page-", "");
    router.push({ name: "page", params: { pageId } });
    return;
  }
  router.push({ name: key });
}

function handleSettingsClick() {
  router.push({ name: "settings" });
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
                <div class="header-left">
                  <h1 class="app-title">Femtimer</h1>
                  <NMenu
                    mode="horizontal"
                    :options="menuOptions"
                    :value="activeKey"
                    @update:value="handleMenuUpdate"
                  />
                </div>
                <div class="header-right">
                  <NButton
                    quaternary
                    circle
                    :class="{ 'settings-active': route.name === 'settings' }"
                    @click="handleSettingsClick"
                  >
                    <template #icon>
                      <NIcon size="20"><SettingsOutline /></NIcon>
                    </template>
                  </NButton>
                </div>
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

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-right {
  display: flex;
  align-items: center;
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

.settings-active {
  color: var(--primary-color);
}

.settings-active :deep(.n-icon) {
  color: #f98fed;
}
</style>
