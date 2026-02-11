<script setup lang="ts">
import { BarChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { NCard, NEmpty, NGi, NGrid, NSpace, NStatistic } from "naive-ui";
import { provide, ref } from "vue";
import VChart, { THEME_KEY } from "vue-echarts";

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
]);

provide(THEME_KEY, "dark");

// Placeholder data - will be replaced with real data from Dexie
const sampleTimes = [
  12.5, 11.8, 13.2, 10.9, 12.1, 11.5, 12.8, 11.2, 10.5, 11.9,
];

const timeChartOption = ref({
  backgroundColor: "transparent",
  tooltip: {
    trigger: "axis",
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    data: sampleTimes.map((_, i) => i + 1),
  },
  yAxis: {
    type: "value",
    name: "Time (s)",
  },
  series: [
    {
      name: "Solve Time",
      type: "line",
      smooth: true,
      data: sampleTimes,
      lineStyle: {
        color: "#f98fed",
      },
      itemStyle: {
        color: "#f98fed",
      },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(249, 143, 237, 0.4)" },
            { offset: 1, color: "rgba(195, 126, 240, 0.05)" },
          ],
        },
      },
    },
  ],
});

const distributionOption = ref({
  backgroundColor: "transparent",
  tooltip: {
    trigger: "axis",
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    data: ["10-11s", "11-12s", "12-13s", "13-14s"],
  },
  yAxis: {
    type: "value",
    name: "Count",
  },
  series: [
    {
      type: "bar",
      data: [2, 4, 3, 1],
      itemStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: "#ffa9d0" },
            { offset: 0.5, color: "#f98fed" },
            { offset: 1, color: "#c37ef0" },
          ],
        },
      },
    },
  ],
});

const hasSolves = ref(false);
</script>

<template>
  <div class="stats-view">
    <NGrid :cols="4" :x-gap="16" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="4 m:1">
        <NCard>
          <NStatistic label="Total Solves" value="-" />
        </NCard>
      </NGi>
      <NGi span="4 m:1">
        <NCard>
          <NStatistic label="Best Time" value="-" />
        </NCard>
      </NGi>
      <NGi span="4 m:1">
        <NCard>
          <NStatistic label="Best ao5" value="-" />
        </NCard>
      </NGi>
      <NGi span="4 m:1">
        <NCard>
          <NStatistic label="Best ao12" value="-" />
        </NCard>
      </NGi>
    </NGrid>

    <NSpace vertical size="large" class="charts-container">
      <NCard title="Solve Times">
        <template v-if="hasSolves">
          <VChart :option="timeChartOption" autoresize class="chart" />
        </template>
        <template v-else>
          <div class="chart-placeholder">
            <NEmpty description="No solves yet. Complete some solves to see your progress!" />
          </div>
        </template>
      </NCard>

      <NCard title="Time Distribution">
        <template v-if="hasSolves">
          <VChart :option="distributionOption" autoresize class="chart" />
        </template>
        <template v-else>
          <div class="chart-placeholder">
            <NEmpty description="No data available" />
          </div>
        </template>
      </NCard>
    </NSpace>
  </div>
</template>

<style scoped>
.stats-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.charts-container {
  width: 100%;
}

.chart {
  height: 300px;
  width: 100%;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
