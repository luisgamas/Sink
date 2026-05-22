<script setup lang="ts">
import type { MetricItem } from '@/types'
import { Filter } from 'lucide-vue-next'
import { VList } from 'virtua/vue'

const props = defineProps<{
  metrics: MetricItem[]
  type: string
}>()

const FILTERABLE_TYPES = ['country', 'region', 'city', 'browser', 'os', 'device', 'deviceType', 'browserType', 'referer', 'language', 'timezone', 'slug']

const analysisStore = useDashboardAnalysisStore()

const isFilterable = computed(() => FILTERABLE_TYPES.includes(props.type))

function isActive(name: string) {
  const current = analysisStore.filters[props.type]
  if (!current)
    return false
  return current.split(',').includes(name)
}

function toggleFilter(name: string) {
  if (!isFilterable.value)
    return
  const current = analysisStore.filters[props.type]
  const values = current ? current.split(',').filter(Boolean) : []
  const index = values.indexOf(name)
  if (index >= 0) {
    values.splice(index, 1)
  }
  else {
    values.push(name)
  }
  analysisStore.updateFilter(props.type, values.join(','))
}
</script>

<template>
  <div class="w-full text-sm">
    <div
      class="
        flex justify-between border-b leading-[48px] transition-colors
        hover:bg-muted/50
      "
    >
      <div
        class="
          h-12 px-4 text-left align-middle font-medium text-muted-foreground
        "
      >
        {{ $t('dashboard.name') }}
      </div>
      <div
        class="
          h-12 px-4 text-right align-middle font-medium text-muted-foreground
        "
      >
        {{ $t('dashboard.count') }}
      </div>
    </div>
    <VList
      v-slot="{ item: metric }"
      :data="metrics"
      :style="{ height: '342px' }"
    >
      <div
        class="border-b px-4 py-2 transition-colors" :class="[
          isFilterable ? `
            cursor-pointer
            hover:bg-accent/50
          ` : `hover:bg-muted/50`,
          isActive(metric.name) ? 'bg-accent/30' : '',
        ]"
        @click="toggleFilter(metric.name)"
      >
        <div class="flex justify-between">
          <div
            class="flex flex-1 items-center gap-1.5 truncate leading-5"
          >
            <Filter
              v-if="isActive(metric.name)"
              class="h-3 w-3 shrink-0 text-primary"
            />
            <DashboardAnalysisMetricsName
              :name="metric.name"
              :type="type"
            />
          </div>
          <div
            class="text-right"
          >
            {{ formatNumber(metric.count) }}
            <span class="text-xs text-muted-foreground">({{ metric.percent }}%)</span>
          </div>
        </div>
        <div
          class="flex-1"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger class="w-full">
                <Progress
                  v-model="metric.percent"
                  class="h-2"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{{ metric.percent }}%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </VList>
  </div>
</template>

<style scoped>
:deep([data-slot='progress']) {
  background-color: var(--muted);
}

:deep([data-slot='progress-indicator']) {
  background-color: var(--chart-1);
}
</style>
