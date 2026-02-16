<script setup lang="ts">
import { usePagesStore } from "@/stores/pages";
import { DEFAULT_GLOBAL_LINK_ID } from "@/types/links";
import type { Link } from "@/types/links";
import { AddOutline, TrashOutline } from "@vicons/ionicons5";
import {
  NButton,
  NCheckbox,
  NDivider,
  NIcon,
  NInput,
  NModal,
  NSpace,
  NText,
} from "naive-ui";
import { computed, ref, watch } from "vue";

const props = defineProps<{
  show: boolean;
  currentLinkIds: string[];
  pageId: string;
}>();

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "update", linkIds: string[]): void;
}>();

const pagesStore = usePagesStore();

const currentPage = computed(() =>
  pagesStore.pages.find((p) => p.id === props.pageId),
);

const globalLinks = computed(() => pagesStore.globalLinks);
const pageLinks = computed(() => currentPage.value?.pageLinks ?? []);

// Local state for selected links (updated on toggle)
const selectedLinkIds = ref<string[]>([...props.currentLinkIds]);

// Watch for prop changes (when dialog opens)
watch(
  () => props.currentLinkIds,
  (newIds) => {
    selectedLinkIds.value = [...newIds];
  },
  { deep: true },
);

// Create new link state
const showGlobalLinkInput = ref(false);
const showPageLinkInput = ref(false);
const newGlobalLinkName = ref("");
const newPageLinkName = ref("");

function toggleLink(linkId: string) {
  const index = selectedLinkIds.value.indexOf(linkId);
  if (index === -1) {
    selectedLinkIds.value.push(linkId);
  } else {
    selectedLinkIds.value.splice(index, 1);
  }
  // Emit immediately on toggle
  emit("update", [...selectedLinkIds.value]);
}

function isLinkSelected(linkId: string): boolean {
  return selectedLinkIds.value.includes(linkId);
}

async function createGlobalLink() {
  if (!newGlobalLinkName.value.trim()) return;
  const link = await pagesStore.createGlobalLink(newGlobalLinkName.value.trim());
  newGlobalLinkName.value = "";
  showGlobalLinkInput.value = false;
  // Auto-select the new link
  toggleLink(link.id);
}

async function createPageLink() {
  if (!newPageLinkName.value.trim()) return;
  const link = await pagesStore.createPageLink(
    props.pageId,
    newPageLinkName.value.trim(),
  );
  newPageLinkName.value = "";
  showPageLinkInput.value = false;
  // Auto-select the new link
  toggleLink(link.id);
}

async function deleteGlobalLink(linkId: string) {
  if (linkId === DEFAULT_GLOBAL_LINK_ID) return; // Can't delete default
  await pagesStore.deleteGlobalLink(linkId);
  // Remove from selection if selected
  const index = selectedLinkIds.value.indexOf(linkId);
  if (index !== -1) {
    selectedLinkIds.value.splice(index, 1);
    emit("update", [...selectedLinkIds.value]);
  }
}

async function deletePageLink(linkId: string) {
  if (currentPage.value && linkId === currentPage.value.defaultLinkId) return; // Can't delete default page link
  await pagesStore.deletePageLink(props.pageId, linkId);
  // Remove from selection if selected
  const index = selectedLinkIds.value.indexOf(linkId);
  if (index !== -1) {
    selectedLinkIds.value.splice(index, 1);
    emit("update", [...selectedLinkIds.value]);
  }
}

function close() {
  emit("update:show", false);
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    title="Select Links"
    style="max-width: 500px"
    @update:show="$emit('update:show', $event)"
  >
    <NSpace vertical size="large">
      <!-- Global Links Section -->
      <div>
        <NText tag="div" style="margin-bottom: 12px; font-weight: 500">
          Global Links
        </NText>
        <NText
          tag="div"
          depth="3"
          style="margin-bottom: 12px; font-size: 12px"
        >
          Shared across all pages
        </NText>
        <NSpace vertical size="small">
          <div
            v-for="link in globalLinks"
            :key="link.id"
            class="link-item"
          >
            <NCheckbox
              :checked="isLinkSelected(link.id)"
              @update:checked="toggleLink(link.id)"
            >
              <span class="link-name">{{ link.name }}</span>
            </NCheckbox>
            <NButton
              v-if="link.id !== DEFAULT_GLOBAL_LINK_ID"
              quaternary
              circle
              size="tiny"
              @click.stop="deleteGlobalLink(link.id)"
            >
              <template #icon>
                <NIcon size="14"><TrashOutline /></NIcon>
              </template>
            </NButton>
          </div>

          <!-- Create global link input -->
          <div v-if="showGlobalLinkInput" class="create-link-input">
            <NInput
              v-model:value="newGlobalLinkName"
              placeholder="Link name"
              size="small"
              @keyup.enter="createGlobalLink"
              @keyup.esc="showGlobalLinkInput = false"
            />
            <NButton size="small" type="primary" @click="createGlobalLink">
              Create
            </NButton>
            <NButton
              size="small"
              quaternary
              @click="showGlobalLinkInput = false"
            >
              Cancel
            </NButton>
          </div>

          <!-- Create global link button -->
          <NButton
            v-else
            dashed
            block
            size="small"
            @click="showGlobalLinkInput = true"
          >
            <template #icon>
              <NIcon><AddOutline /></NIcon>
            </template>
            Create Global Link
          </NButton>
        </NSpace>
      </div>

      <NDivider />

      <!-- Page Links Section -->
      <div>
        <NText tag="div" style="margin-bottom: 12px; font-weight: 500">
          Page Links
        </NText>
        <NText
          tag="div"
          depth="3"
          style="margin-bottom: 12px; font-size: 12px"
        >
          Only available on this page
        </NText>
        <NSpace vertical size="small">
          <div
            v-for="link in pageLinks"
            :key="link.id"
            class="link-item"
          >
            <NCheckbox
              :checked="isLinkSelected(link.id)"
              @update:checked="toggleLink(link.id)"
            >
              <span class="link-name">{{ link.name }}</span>
              <span
                v-if="currentPage && link.id === currentPage.defaultLinkId"
                class="default-badge"
              >
                Default
              </span>
            </NCheckbox>
            <NButton
              v-if="currentPage && link.id !== currentPage.defaultLinkId"
              quaternary
              circle
              size="tiny"
              @click.stop="deletePageLink(link.id)"
            >
              <template #icon>
                <NIcon size="14"><TrashOutline /></NIcon>
              </template>
            </NButton>
          </div>

          <!-- Create page link input -->
          <div v-if="showPageLinkInput" class="create-link-input">
            <NInput
              v-model:value="newPageLinkName"
              placeholder="Link name"
              size="small"
              @keyup.enter="createPageLink"
              @keyup.esc="showPageLinkInput = false"
            />
            <NButton size="small" type="primary" @click="createPageLink">
              Create
            </NButton>
            <NButton size="small" quaternary @click="showPageLinkInput = false">
              Cancel
            </NButton>
          </div>

          <!-- Create page link button -->
          <NButton
            v-else
            dashed
            block
            size="small"
            @click="showPageLinkInput = true"
          >
            <template #icon>
              <NIcon><AddOutline /></NIcon>
            </template>
            Create Page Link
          </NButton>
        </NSpace>
      </div>
    </NSpace>

    <template #footer>
      <NButton block @click="close">Close</NButton>
    </template>
  </NModal>
</template>

<style scoped>
.link-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s;
}

.link-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.link-name {
  font-size: 14px;
  margin-left: 8px;
}

.default-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-muted);
  margin-left: 8px;
}

.create-link-input {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
