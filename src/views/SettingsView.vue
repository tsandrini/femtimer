<script setup lang="ts">
import {
  NButton,
  NCard,
  NDivider,
  NForm,
  NFormItem,
  NInputNumber,
  NSelect,
  NSpace,
  NSwitch,
} from "naive-ui";
import { ref } from "vue";

const timerSettings = ref({
  holdToStart: true,
  holdTime: 300,
  inspection: true,
  inspectionTime: 15,
  hideTime: false,
});

const cubeEvent = ref("333");

const eventOptions = [
  { label: "3x3x3", value: "333" },
  { label: "2x2x2", value: "222" },
  { label: "4x4x4", value: "444" },
  { label: "5x5x5", value: "555" },
  { label: "Pyraminx", value: "pyram" },
  { label: "Megaminx", value: "minx" },
  { label: "Skewb", value: "skewb" },
  { label: "Square-1", value: "sq1" },
];
</script>

<template>
  <div class="settings-view">
    <NSpace vertical size="large">
      <NCard title="Cube Event">
        <NForm label-placement="left" label-width="auto">
          <NFormItem label="Event">
            <NSelect v-model:value="cubeEvent" :options="eventOptions" />
          </NFormItem>
        </NForm>
      </NCard>

      <NCard title="Timer Settings">
        <NForm label-placement="left" label-width="auto">
          <NFormItem label="Hold to start">
            <NSwitch v-model:value="timerSettings.holdToStart" />
          </NFormItem>
          <NFormItem label="Hold time (ms)" v-if="timerSettings.holdToStart">
            <NInputNumber
              v-model:value="timerSettings.holdTime"
              :min="0"
              :max="1000"
              :step="50"
            />
          </NFormItem>
          <NFormItem label="Inspection time">
            <NSwitch v-model:value="timerSettings.inspection" />
          </NFormItem>
          <NFormItem label="Inspection duration (s)" v-if="timerSettings.inspection">
            <NInputNumber
              v-model:value="timerSettings.inspectionTime"
              :min="0"
              :max="60"
            />
          </NFormItem>
          <NFormItem label="Hide time while solving">
            <NSwitch v-model:value="timerSettings.hideTime" />
          </NFormItem>
        </NForm>
      </NCard>

      <NCard title="Data Management">
        <NSpace vertical>
          <NButton secondary>Export All Data</NButton>
          <NButton secondary>Import Data</NButton>
          <NDivider />
          <NButton type="error" secondary>Clear All Data</NButton>
        </NSpace>
      </NCard>
    </NSpace>
  </div>
</template>

<style scoped>
.settings-view {
  max-width: 600px;
}
</style>
