<script setup lang="ts">
import { getWidgetRegistry } from "@/registry";
import type { GridPosition } from "@/types/widgets";
import { CloseOutline, MoveOutline, SettingsOutline } from "@vicons/ionicons5";
import { NButton, NIcon } from "naive-ui";
import { type Component, computed, ref } from "vue";

const props = defineProps<{
  widgetId: string;
  typeId: string;
  position: GridPosition;
  config: Record<string, unknown>;
  isEditMode: boolean;
  gridColumns: number;
  rowHeight: number;
  gap: number;
}>();

const emit = defineEmits<{
  (e: "update:position", position: GridPosition): void;
  (e: "remove"): void;
  (e: "configure"): void;
  (e: "updateConfig", config: Record<string, unknown>): void;
}>();

function handleUpdateConfig(config: Record<string, unknown>) {
  emit("updateConfig", config);
}

const registry = getWidgetRegistry();
const widgetRegistration = computed(() => registry.get(props.typeId));

const WidgetComponent = computed<Component | null>(() => {
  return widgetRegistration.value?.component ?? null;
});

const gridStyle = computed(() => ({
  gridColumn: `${props.position.x + 1} / span ${props.position.width}`,
  gridRow: `${props.position.y + 1} / span ${props.position.height}`,
}));

// Drag state
const isDragging = ref(false);
const isResizing = ref(false);
const dragStartPos = ref({ x: 0, y: 0 });
const originalPosition = ref({ ...props.position });

function startDrag(e: PointerEvent) {
  if (!props.isEditMode) return;
  e.preventDefault();
  isDragging.value = true;
  dragStartPos.value = { x: e.clientX, y: e.clientY };
  originalPosition.value = { ...props.position };
  document.addEventListener("pointermove", onDrag);
  document.addEventListener("pointerup", stopDrag);
}

function onDrag(e: PointerEvent) {
  if (!isDragging.value) return;
  const deltaX = e.clientX - dragStartPos.value.x;
  const deltaY = e.clientY - dragStartPos.value.y;

  // Calculate grid cell size (approximate - will be refined by parent)
  const cellWidth =
    (window.innerWidth - 48 - props.gap * (props.gridColumns - 1)) /
    props.gridColumns;
  const cellHeight = props.rowHeight + props.gap;

  const colDelta = Math.round(deltaX / cellWidth);
  const rowDelta = Math.round(deltaY / cellHeight);

  const newX = Math.max(
    0,
    Math.min(
      props.gridColumns - props.position.width,
      originalPosition.value.x + colDelta,
    ),
  );
  const newY = Math.max(0, originalPosition.value.y + rowDelta);

  if (newX !== props.position.x || newY !== props.position.y) {
    emit("update:position", {
      ...props.position,
      x: newX,
      y: newY,
    });
  }
}

function stopDrag() {
  isDragging.value = false;
  document.removeEventListener("pointermove", onDrag);
  document.removeEventListener("pointerup", stopDrag);
}

function startResize(e: PointerEvent) {
  if (!props.isEditMode) return;
  e.preventDefault();
  e.stopPropagation();
  isResizing.value = true;
  dragStartPos.value = { x: e.clientX, y: e.clientY };
  originalPosition.value = { ...props.position };
  document.addEventListener("pointermove", onResize);
  document.addEventListener("pointerup", stopResize);
}

function onResize(e: PointerEvent) {
  if (!isResizing.value) return;
  const deltaX = e.clientX - dragStartPos.value.x;
  const deltaY = e.clientY - dragStartPos.value.y;

  const cellWidth =
    (window.innerWidth - 48 - props.gap * (props.gridColumns - 1)) /
    props.gridColumns;
  const cellHeight = props.rowHeight + props.gap;

  const widthDelta = Math.round(deltaX / cellWidth);
  const heightDelta = Math.round(deltaY / cellHeight);

  const metadata = widgetRegistration.value?.metadata;
  const minWidth = metadata?.minSize?.width ?? 1;
  const minHeight = metadata?.minSize?.height ?? 1;
  const maxWidth = metadata?.maxSize?.width ?? props.gridColumns;
  const maxHeight = metadata?.maxSize?.height ?? 20;

  const newWidth = Math.max(
    minWidth,
    Math.min(
      maxWidth,
      props.gridColumns - props.position.x,
      originalPosition.value.width + widthDelta,
    ),
  );
  const newHeight = Math.max(
    minHeight,
    Math.min(maxHeight, originalPosition.value.height + heightDelta),
  );

  if (
    newWidth !== props.position.width ||
    newHeight !== props.position.height
  ) {
    emit("update:position", {
      ...props.position,
      width: newWidth,
      height: newHeight,
    });
  }
}

function stopResize() {
  isResizing.value = false;
  document.removeEventListener("pointermove", onResize);
  document.removeEventListener("pointerup", stopResize);
}
</script>

<template>
  <div
    class="grid-widget"
    :class="{ 'is-edit-mode': isEditMode, 'is-dragging': isDragging, 'is-resizing': isResizing }"
    :style="gridStyle"
  >
    <!-- Edit mode overlay -->
    <div v-if="isEditMode" class="edit-overlay">
      <div class="edit-toolbar">
        <NButton
          quaternary
          circle
          size="tiny"
          class="drag-handle"
          @pointerdown="startDrag"
        >
          <template #icon>
            <NIcon size="14"><MoveOutline /></NIcon>
          </template>
        </NButton>
        <NButton quaternary circle size="tiny" @click="$emit('configure')">
          <template #icon>
            <NIcon size="14"><SettingsOutline /></NIcon>
          </template>
        </NButton>
        <NButton quaternary circle size="tiny" @click="$emit('remove')">
          <template #icon>
            <NIcon size="14"><CloseOutline /></NIcon>
          </template>
        </NButton>
      </div>
    </div>

    <!-- Widget content -->
    <div class="widget-container">
      <component
        v-if="WidgetComponent"
        :is="WidgetComponent"
        :instance-id="widgetId"
        :config="config"
        :is-edit-mode="isEditMode"
        @updateConfig="handleUpdateConfig"
      />
    </div>

    <!-- Resize handle -->
    <div
      v-if="isEditMode"
      class="resize-handle"
      @pointerdown="startResize"
    />
  </div>
</template>

<style scoped>
.grid-widget {
  position: relative;
  min-height: 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.grid-widget.is-edit-mode {
  outline: 2px dashed transparent;
  transition: outline-color 0.2s;
}

.grid-widget.is-edit-mode:hover {
  outline-color: var(--color-primary);
}

.grid-widget.is-dragging,
.grid-widget.is-resizing {
  outline-color: var(--color-primary);
  opacity: 0.8;
  z-index: 10;
}

.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  pointer-events: none;
}

.edit-toolbar {
  display: flex;
  gap: 4px;
  padding: 4px;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 0 0 8px 0;
  width: fit-content;
}

.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

.widget-container {
  height: 100%;
  width: 100%;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  cursor: se-resize;
  background: linear-gradient(
    135deg,
    transparent 50%,
    var(--color-primary) 50%
  );
  border-radius: 0 0 12px 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.grid-widget.is-edit-mode:hover .resize-handle,
.grid-widget.is-resizing .resize-handle {
  opacity: 1;
}
</style>
