<script setup lang="ts">
import PageEditor from "@/components/PageEditor.vue";
import { usePagesStore } from "@/stores/pages";
import { NEmpty, NSpin, NText } from "naive-ui";
import { computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const pagesStore = usePagesStore();

const pageId = computed(() => route.params.pageId as string);
const isEditMode = computed({
  get: () => pagesStore.isEditMode,
  set: (value) => pagesStore.setEditMode(value),
});

const page = computed(() => pagesStore.currentPage);

// Load page on mount and when pageId changes
onMounted(async () => {
  await loadPage();
});

watch(pageId, async () => {
  await loadPage();
});

async function loadPage() {
  if (pageId.value) {
    await pagesStore.setCurrentPage(pageId.value);

    // Check for edit query param
    if (route.query.edit === "true") {
      pagesStore.setEditMode(true);
      // Remove query param from URL
      router.replace({ params: route.params, query: {} });
    }
  }
}
</script>

<template>
  <div class="page-view">
    <template v-if="pagesStore.isLoading">
      <div class="page-loading">
        <NSpin size="large" />
      </div>
    </template>

    <template v-else-if="page">
      <PageEditor
        :page="page"
        :is-edit-mode="isEditMode"
        @update:is-edit-mode="isEditMode = $event"
      />
    </template>

    <template v-else>
      <div class="page-placeholder">
        <NEmpty description="Page not found">
          <template #extra>
            <NText depth="3">Page ID: {{ pageId }}</NText>
          </template>
        </NEmpty>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-view {
  height: 100%;
  width: 100%;
}

.page-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.page-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}
</style>
