import {
  addPage,
  deletePage as dbDeletePage,
  saveFullPage as dbSaveFullPage,
  updatePage as dbUpdatePage,
  getAllPages,
  getPage,
} from "@/services/database";
import type { Page } from "@/types/pages";
import { DEFAULT_GRID_CONFIG } from "@/types/pages";
import type { WidgetInstance } from "@/types/widgets";
import { defineStore } from "pinia";
import { computed, ref, toRaw } from "vue";

export const usePagesStore = defineStore("pages", () => {
  const pages = ref<Page[]>([]);
  const currentPageId = ref<string | null>(null);
  const isEditMode = ref(false);
  const isLoading = ref(false);

  const currentPage = computed(() =>
    currentPageId.value
      ? (pages.value.find((p) => p.id === currentPageId.value) ?? null)
      : null,
  );

  const userPages = computed(() =>
    pages.value
      .filter((p) => !p.isTemplate)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  const templatePages = computed(() =>
    pages.value
      .filter((p) => p.isTemplate)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  async function loadPages() {
    isLoading.value = true;
    try {
      pages.value = await getAllPages();
    } finally {
      isLoading.value = false;
    }
  }

  async function createPage(
    name: string,
    icon = "DocumentOutline",
  ): Promise<Page> {
    const now = new Date();
    const maxSortOrder = Math.max(0, ...pages.value.map((p) => p.sortOrder));

    const newPage: Page = {
      id: crypto.randomUUID(),
      name,
      icon,
      isTemplate: false,
      isEditable: true,
      sortOrder: maxSortOrder + 1,
      gridConfig: { ...DEFAULT_GRID_CONFIG },
      widgets: [],
      createdAt: now,
      updatedAt: now,
    };

    await addPage(newPage);
    pages.value.push(newPage);
    return newPage;
  }

  async function updatePage(id: string, updates: Partial<Page>) {
    await dbUpdatePage(id, updates);
    const index = pages.value.findIndex((p) => p.id === id);
    if (index !== -1) {
      pages.value[index] = {
        ...pages.value[index],
        ...updates,
        updatedAt: new Date(),
      };
    }
  }

  function updatePageLocal(id: string, updates: Partial<Page>) {
    const index = pages.value.findIndex((p) => p.id === id);
    if (index !== -1) {
      pages.value[index] = {
        ...pages.value[index],
        ...updates,
        updatedAt: new Date(),
      };
    }
  }

  async function deletePage(id: string) {
    await dbDeletePage(id);
    const index = pages.value.findIndex((p) => p.id === id);
    if (index !== -1) {
      pages.value.splice(index, 1);
    }
    if (currentPageId.value === id) {
      currentPageId.value = null;
    }
  }

  async function setCurrentPage(id: string | null) {
    currentPageId.value = id;
    if (id && !pages.value.find((p) => p.id === id)) {
      const page = await getPage(id);
      if (page) {
        pages.value.push(page);
      }
    }
  }

  function setEditMode(editing: boolean) {
    isEditMode.value = editing;
  }

  function addWidget(pageId: string, widget: WidgetInstance) {
    const page = pages.value.find((p) => p.id === pageId);
    if (page) {
      page.widgets.push(widget);
      page.updatedAt = new Date();
    }
  }

  function updateWidget(
    pageId: string,
    widgetId: string,
    updates: Partial<WidgetInstance>,
  ) {
    const page = pages.value.find((p) => p.id === pageId);
    if (page) {
      const widget = page.widgets.find((w) => w.id === widgetId);
      if (widget) {
        Object.assign(widget, updates, { updatedAt: new Date() });
        page.updatedAt = new Date();
      }
    }
  }

  async function updateWidgetConfig(
    pageId: string,
    widgetId: string,
    configUpdates: Record<string, unknown>,
  ) {
    const page = pages.value.find((p) => p.id === pageId);
    if (page) {
      const widget = page.widgets.find((w) => w.id === widgetId);
      if (widget) {
        widget.config = { ...widget.config, ...configUpdates };
        widget.updatedAt = new Date();
        page.updatedAt = new Date();
        // Persist config changes immediately to database
        await savePage(pageId);
      }
    }
  }

  function removeWidget(pageId: string, widgetId: string) {
    const page = pages.value.find((p) => p.id === pageId);
    if (page) {
      const index = page.widgets.findIndex((w) => w.id === widgetId);
      if (index !== -1) {
        page.widgets.splice(index, 1);
        page.updatedAt = new Date();
      }
    }
  }

  async function savePage(pageId: string) {
    const page = pages.value.find((p) => p.id === pageId);
    if (page) {
      // Deep clone to plain object (removes Vue reactivity proxies, preserves Dates)
      const plainPage = JSON.parse(JSON.stringify(toRaw(page))) as Page;
      // Restore Date objects
      plainPage.createdAt = new Date(plainPage.createdAt);
      plainPage.updatedAt = new Date(plainPage.updatedAt);
      for (const widget of plainPage.widgets) {
        widget.createdAt = new Date(widget.createdAt);
        widget.updatedAt = new Date(widget.updatedAt);
      }
      await dbSaveFullPage(plainPage);
      page.updatedAt = plainPage.updatedAt;
    }
  }

  async function reloadPage(pageId: string) {
    const savedPage = await getPage(pageId);
    if (savedPage) {
      const index = pages.value.findIndex((p) => p.id === pageId);
      if (index !== -1) {
        pages.value[index] = savedPage;
      }
    }
  }

  return {
    pages,
    currentPageId,
    currentPage,
    userPages,
    templatePages,
    isEditMode,
    isLoading,
    loadPages,
    createPage,
    updatePage,
    updatePageLocal,
    deletePage,
    setCurrentPage,
    setEditMode,
    addWidget,
    updateWidget,
    updateWidgetConfig,
    removeWidget,
    savePage,
    reloadPage,
  };
});
