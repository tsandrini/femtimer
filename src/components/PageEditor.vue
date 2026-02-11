<script setup lang="ts">
import GridWidget from "@/components/GridWidget.vue";
import WidgetPicker from "@/components/WidgetPicker.vue";
import { getWidgetRegistry } from "@/registry";
import { usePagesStore } from "@/stores/pages";
import type { Page } from "@/types/pages";
import type { GridPosition, WidgetInstance } from "@/types/widgets";
import {
  AddOutline,
  CheckmarkOutline,
  CloseOutline,
  CreateOutline,
  TrashOutline,
} from "@vicons/ionicons5";
import {
  NButton,
  NIcon,
  NInput,
  NSpace,
  useDialog,
  useMessage,
} from "naive-ui";
import { computed, onUnmounted, ref, watch } from "vue";

const props = defineProps<{
  page: Page;
  isEditMode: boolean;
}>();

const emit = defineEmits<{
  (e: "update:isEditMode", value: boolean): void;
  (e: "delete"): void;
}>();

const pagesStore = usePagesStore();
const message = useMessage();
const dialog = useDialog();
const registry = getWidgetRegistry();

const showWidgetPicker = ref(false);
const editingName = ref(false);
const pageName = ref(props.page.name);

// Grid resize state
const gridRef = ref<HTMLElement | null>(null);
const isResizing = ref(false);
const resizeStartY = ref(0);
const resizeStartRows = ref(0);

watch(
  () => props.page.name,
  (newName) => {
    pageName.value = newName;
  },
);

const gridStyle = computed(() => {
  const { rowHeight, gap, padding, minRows } = props.page.gridConfig;
  // Calculate min-height: minRows * rowHeight + (minRows - 1) * gap + 2 * padding
  const minHeight = minRows * rowHeight + (minRows - 1) * gap + 2 * padding;
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${props.page.gridConfig.columns}, 1fr)`,
    gridAutoRows: `${rowHeight}px`,
    gap: `${gap}px`,
    padding: `${padding}px`,
    minHeight: `${minHeight}px`,
  };
});

// Grid resize handlers
function handleResizeStart(event: MouseEvent) {
  isResizing.value = true;
  resizeStartY.value = event.clientY;
  resizeStartRows.value = props.page.gridConfig.minRows;
  document.addEventListener("mousemove", handleResizeMove);
  document.addEventListener("mouseup", handleResizeEnd);
}

function handleResizeMove(event: MouseEvent) {
  if (!isResizing.value) return;

  const { rowHeight, gap } = props.page.gridConfig;
  const deltaY = event.clientY - resizeStartY.value;
  // Calculate how many rows the delta represents
  const deltaRows = Math.round(deltaY / (rowHeight + gap));
  const newMinRows = Math.max(2, resizeStartRows.value + deltaRows);

  if (newMinRows !== props.page.gridConfig.minRows) {
    pagesStore.updatePageLocal(props.page.id, {
      gridConfig: { ...props.page.gridConfig, minRows: newMinRows },
    });
  }
}

function handleResizeEnd() {
  isResizing.value = false;
  document.removeEventListener("mousemove", handleResizeMove);
  document.removeEventListener("mouseup", handleResizeEnd);
}

onUnmounted(() => {
  document.removeEventListener("mousemove", handleResizeMove);
  document.removeEventListener("mouseup", handleResizeEnd);
});

function handleWidgetSelect(typeId: string) {
  const registration = registry.get(typeId);
  if (!registration) return;

  const { defaultSize, defaultConfig } = registration.metadata;

  // Find first available position
  const position = findAvailablePosition(defaultSize.width, defaultSize.height);

  const newWidget: WidgetInstance = {
    id: crypto.randomUUID(),
    typeId,
    position,
    config: { ...defaultConfig },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  pagesStore.addWidget(props.page.id, newWidget);
}

function findAvailablePosition(width: number, height: number): GridPosition {
  const { columns } = props.page.gridConfig;
  const occupiedCells = new Set<string>();

  // Mark all occupied cells
  for (const widget of props.page.widgets) {
    for (
      let x = widget.position.x;
      x < widget.position.x + widget.position.width;
      x++
    ) {
      for (
        let y = widget.position.y;
        y < widget.position.y + widget.position.height;
        y++
      ) {
        occupiedCells.add(`${x},${y}`);
      }
    }
  }

  // Find first available position
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x <= columns - width; x++) {
      let fits = true;
      for (let dx = 0; dx < width && fits; dx++) {
        for (let dy = 0; dy < height && fits; dy++) {
          if (occupiedCells.has(`${x + dx},${y + dy}`)) {
            fits = false;
          }
        }
      }
      if (fits) {
        return { x, y, width, height };
      }
    }
  }

  // Fallback: place at end
  const maxY = Math.max(
    0,
    ...props.page.widgets.map((w) => w.position.y + w.position.height),
  );
  return { x: 0, y: maxY, width, height };
}

function handlePositionUpdate(widgetId: string, position: GridPosition) {
  pagesStore.updateWidget(props.page.id, widgetId, { position });
}

function handleRemoveWidget(widgetId: string) {
  dialog.warning({
    title: "Remove Widget",
    content: "Are you sure you want to remove this widget?",
    positiveText: "Remove",
    negativeText: "Cancel",
    onPositiveClick: () => {
      pagesStore.removeWidget(props.page.id, widgetId);
    },
  });
}

function handleConfigureWidget(_widgetId: string) {
  // TODO: Implement widget configuration modal
  message.info("Widget configuration coming soon");
}

function handleUpdateWidgetConfig(
  widgetId: string,
  config: Record<string, unknown>,
) {
  pagesStore.updateWidgetConfig(props.page.id, widgetId, config);
}

async function handleSave() {
  await pagesStore.savePage(props.page.id);
  emit("update:isEditMode", false);
  message.success("Page saved");
}

function handleCancel() {
  dialog.warning({
    title: "Discard Changes",
    content: "Are you sure you want to discard your changes?",
    positiveText: "Discard",
    negativeText: "Keep Editing",
    onPositiveClick: async () => {
      await pagesStore.reloadPage(props.page.id);
      emit("update:isEditMode", false);
    },
  });
}

function handleDeletePage() {
  dialog.error({
    title: "Delete Page",
    content: `Are you sure you want to delete "${props.page.name}"? This action cannot be undone.`,
    positiveText: "Delete",
    negativeText: "Cancel",
    onPositiveClick: async () => {
      await pagesStore.deletePage(props.page.id);
      emit("delete");
      message.success("Page deleted");
    },
  });
}

function startEditingName() {
  editingName.value = true;
}

function saveName() {
  if (pageName.value.trim()) {
    pagesStore.updatePageLocal(props.page.id, { name: pageName.value.trim() });
  } else {
    pageName.value = props.page.name;
  }
  editingName.value = false;
}

function cancelEditingName() {
  pageName.value = props.page.name;
  editingName.value = false;
}
</script>

<template>
  <div class="page-editor">
    <!-- Toolbar -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <template v-if="editingName">
          <NInput
            v-model:value="pageName"
            size="small"
            placeholder="Page name"
            style="width: 200px"
            @keyup.enter="saveName"
            @keyup.escape="cancelEditingName"
          />
          <NButton quaternary circle size="small" @click="saveName">
            <template #icon>
              <NIcon><CheckmarkOutline /></NIcon>
            </template>
          </NButton>
          <NButton quaternary circle size="small" @click="cancelEditingName">
            <template #icon>
              <NIcon><CloseOutline /></NIcon>
            </template>
          </NButton>
        </template>
        <template v-else>
          <h2 class="page-title">{{ page.name }}</h2>
          <NButton
            v-if="isEditMode"
            quaternary
            circle
            size="small"
            @click="startEditingName"
          >
            <template #icon>
              <NIcon><CreateOutline /></NIcon>
            </template>
          </NButton>
        </template>
      </div>

      <div class="toolbar-right">
        <template v-if="isEditMode">
          <NButton size="small" @click="showWidgetPicker = true">
            <template #icon>
              <NIcon><AddOutline /></NIcon>
            </template>
            Add Widget
          </NButton>
          <NSpace>
            <NButton size="small" @click="handleCancel">Cancel</NButton>
            <NButton type="primary" size="small" @click="handleSave">
              Save
            </NButton>
          </NSpace>
        </template>
        <template v-else>
          <NSpace v-if="page.isEditable">
            <NButton
              size="small"
              @click="$emit('update:isEditMode', true)"
            >
              <template #icon>
                <NIcon><CreateOutline /></NIcon>
              </template>
              Edit
            </NButton>
            <NButton
              size="small"
              type="error"
              @click="handleDeletePage"
            >
              <template #icon>
                <NIcon><TrashOutline /></NIcon>
              </template>
              Delete
            </NButton>
          </NSpace>
        </template>
      </div>
    </div>

    <!-- Grid -->
    <div ref="gridRef" class="page-grid" :class="{ 'edit-mode': isEditMode }" :style="gridStyle">
      <GridWidget
        v-for="widget in page.widgets"
        :key="widget.id"
        :widget-id="widget.id"
        :type-id="widget.typeId"
        :position="widget.position"
        :config="widget.config"
        :is-edit-mode="isEditMode"
        :grid-columns="page.gridConfig.columns"
        :row-height="page.gridConfig.rowHeight"
        :gap="page.gridConfig.gap"
        @update:position="handlePositionUpdate(widget.id, $event)"
        @remove="handleRemoveWidget(widget.id)"
        @configure="handleConfigureWidget(widget.id)"
        @updateConfig="handleUpdateWidgetConfig(widget.id, $event)"
      />

      <!-- Empty state -->
      <div
        v-if="page.widgets.length === 0 && isEditMode"
        class="empty-grid"
        @click="showWidgetPicker = true"
      >
        <NIcon size="48" class="empty-icon"><AddOutline /></NIcon>
        <span class="empty-text">Click to add your first widget</span>
      </div>

      <!-- Resize handle -->
      <div
        v-if="isEditMode"
        class="grid-resize-handle"
        :class="{ resizing: isResizing }"
        @mousedown.prevent="handleResizeStart"
      >
        <div class="resize-handle-icon" />
      </div>
    </div>

    <!-- Widget Picker -->
    <WidgetPicker
      v-model:show="showWidgetPicker"
      @select="handleWidgetSelect"
    />
  </div>
</template>

<style scoped>
.page-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--color-surface);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.page-grid {
  flex: 1;
  background: var(--color-surface);
  border-radius: 12px;
  position: relative;
}

.page-grid.edit-mode {
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 80px 80px;
}

.empty-grid {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin: 16px;
  transition: border-color 0.2s, background-color 0.2s;
}

.empty-grid:hover {
  border-color: var(--color-primary);
  background-color: rgba(249, 143, 237, 0.05);
}

.empty-icon {
  color: var(--color-text-muted);
}

.empty-text {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.grid-resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 24px;
  height: 24px;
  cursor: nwse-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 0 12px 0;
  transition: background-color 0.2s;
}

.grid-resize-handle:hover,
.grid-resize-handle.resizing {
  background-color: rgba(255, 255, 255, 0.1);
}

.resize-handle-icon {
  width: 10px;
  height: 10px;
  border-right: 2px solid var(--color-text-muted);
  border-bottom: 2px solid var(--color-text-muted);
  opacity: 0.5;
  transition: opacity 0.2s;
}

.grid-resize-handle:hover .resize-handle-icon,
.grid-resize-handle.resizing .resize-handle-icon {
  opacity: 1;
  border-color: var(--color-primary);
}
</style>
