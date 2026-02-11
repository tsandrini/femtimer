<script setup lang="ts">
import { NCard, NSpace, NText } from "naive-ui";
import { ref } from "vue";

const currentTime = ref("0.00");
const scramble = ref("R U R' U' R' F R2 U' R' U' R U R' F'");
</script>

<template>
  <div class="timer-view">
    <NCard class="scramble-card">
      <NText class="scramble-text">{{ scramble }}</NText>
    </NCard>

    <div class="timer-container">
      <div class="timer-display">
        {{ currentTime }}
      </div>
      <NText depth="3" class="timer-hint">
        Press and hold SPACE to start
      </NText>
    </div>

    <NSpace vertical class="stats-preview">
      <NCard size="small" title="Session Stats">
        <NSpace justify="space-around">
          <div class="stat-item">
            <NText depth="3">ao5</NText>
            <NText>-</NText>
          </div>
          <div class="stat-item">
            <NText depth="3">ao12</NText>
            <NText>-</NText>
          </div>
          <div class="stat-item">
            <NText depth="3">ao100</NText>
            <NText>-</NText>
          </div>
          <div class="stat-item">
            <NText depth="3">mean</NText>
            <NText>-</NText>
          </div>
        </NSpace>
      </NCard>
    </NSpace>
  </div>
</template>

<style scoped>
.timer-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 16px;
}

.scramble-card {
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.scramble-text {
  font-size: 1.25rem;
  font-family: "JetBrains Mono", monospace;
  letter-spacing: 0.05em;
}

.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 0;
}

.timer-display {
  font-size: 8rem;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  user-select: none;
}

.timer-hint {
  font-size: 0.875rem;
}

.stats-preview {
  max-width: 600px;
  width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
</style>
