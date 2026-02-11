<script setup lang="ts">
import { NEmpty, NText } from "naive-ui";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const pageId = computed(() => route.params.pageId as string);

// TODO: Connect to pages store to get actual page data
const page = computed(() => {
  // Placeholder - will be fetched from store
  return null;
});
</script>

<template>
  <div class="page-view">
    <template v-if="page">
      <!-- Page renderer will go here -->
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

.page-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}
</style>
