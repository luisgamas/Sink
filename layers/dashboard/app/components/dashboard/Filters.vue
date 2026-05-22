<script setup lang="ts">
import type { Link } from '@/types'
import { createReusableTemplate, useMediaQuery, watchDebounced } from '@vueuse/core'
import { Check, ChevronsUpDown, X } from 'lucide-vue-next'
import { VList } from 'virtua/vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  filters?: Record<string, string>
}>()

const emit = defineEmits<{
  change: [key: string, value: string]
}>()

const { t } = useI18n()

const [TriggerTemplate, TriggerComponent] = createReusableTemplate()
const [FilterTemplate, FilterComponent] = createReusableTemplate()

const isDesktop = useMediaQuery('(min-width: 640px)')

const links = ref<Link[]>([])
const isOpen = ref(false)
const selectedLinks = ref<string[]>(props.filters?.slug?.split(',').filter(Boolean) ?? [])

watch(() => props.filters?.slug, (newSlug) => {
  const newValue = newSlug?.split(',').filter(Boolean) ?? []
  if (JSON.stringify(newValue) !== JSON.stringify(selectedLinks.value)) {
    selectedLinks.value = newValue
  }
})

const activeNonSlugFilters = computed(() => {
  if (!props.filters)
    return []
  return Object.entries(props.filters)
    .filter(([key, value]) => key !== 'slug' && value)
    .flatMap(([key, value]) =>
      value.split(',').filter(Boolean).map(v => ({ key, value: v })),
    )
})

const hasAnyFilter = computed(() => {
  return selectedLinks.value.length > 0 || activeNonSlugFilters.value.length > 0
})

function removeFilter(key: string, value: string) {
  const current = props.filters?.[key]
  if (!current)
    return
  const values = current.split(',').filter(Boolean).filter(v => v !== value)
  emit('change', key, values.join(','))
}

function clearAllFilters() {
  if (props.filters) {
    for (const key of Object.keys(props.filters)) {
      emit('change', key, '')
    }
  }
  selectedLinks.value = []
}

async function getLinks() {
  try {
    const res = await useAPI<{ links: Link[] }>('/api/link/search', {
      query: { limit: 100 },
    })
    links.value = res.links
  }
  catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  getLinks()
})

watchDebounced(selectedLinks, (value) => {
  emit('change', 'slug', value.join(','))
}, { debounce: 500, maxWait: 1000 })
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5">
    <Badge
      v-for="filter in activeNonSlugFilters"
      :key="`${filter.key}-${filter.value}`"
      variant="secondary"
      class="h-7 gap-1 pr-1 pl-2 text-xs font-medium"
    >
      <span class="text-muted-foreground">{{ t(`dashboard.metrics.${filter.key}`) }}:</span>
      {{ filter.value }}
      <button
        class="
          ml-0.5 rounded-sm p-0.5 transition-colors
          hover:bg-muted
        "
        @click="removeFilter(filter.key, filter.value)"
      >
        <X class="h-3 w-3" />
      </button>
    </Badge>

    <TriggerTemplate>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="isOpen"
        class="
          flex h-auto min-h-9 w-full justify-between px-3 py-1.5
          sm:w-auto sm:min-w-48
        "
      >
        <div
          class="flex flex-wrap items-center gap-1 overflow-hidden"
        >
          <template v-if="selectedLinks.length">
            <Badge
              v-for="slug in selectedLinks.slice(0, 2)"
              :key="slug"
              variant="secondary"
              class="h-5 px-1.5 text-[10px] font-medium"
            >
              {{ slug }}
            </Badge>
            <Badge
              v-if="selectedLinks.length > 2"
              variant="secondary"
              class="h-5 px-1.5 text-[10px] font-medium"
            >
              +{{ selectedLinks.length - 2 }}
            </Badge>
          </template>
          <span v-else class="text-sm text-muted-foreground">
            {{ $t('dashboard.filter_placeholder') }}
          </span>
        </div>
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </TriggerTemplate>
    <FilterTemplate>
      <Command v-model="selectedLinks" multiple>
        <CommandInput :placeholder="selectedLinks.length ? selectedLinks.join(', ') : $t('dashboard.filter_placeholder')" />
        <CommandEmpty>No link found.</CommandEmpty>
        <CommandList :class="{ 'max-h-none': !isDesktop }">
          <CommandGroup>
            <VList
              v-slot="{ item: link }"
              :data="links"
              :style="{ height: isDesktop ? '292px' : '420px' }"
            >
              <CommandItem
                :value="link.slug"
                class="py-2"
              >
                <Check
                  :class="cn(
                    'h-4 w-4',
                    selectedLinks.includes(link.slug) ? 'opacity-100' : `
                      opacity-0
                    `,
                  )"
                />
                {{ link.slug }}
              </CommandItem>
            </VList>
          </CommandGroup>
        </CommandList>
      </Command>
    </FilterTemplate>
    <Popover v-if="isDesktop" v-model:open="isOpen">
      <PopoverTrigger as-child>
        <TriggerComponent />
      </PopoverTrigger>
      <PopoverContent
        class="
          w-full p-0
          sm:w-48
        "
      >
        <FilterComponent />
      </PopoverContent>
    </Popover>

    <Drawer v-else v-model:open="isOpen">
      <DrawerTrigger as-child>
        <TriggerComponent />
      </DrawerTrigger>
      <DrawerContent class="h-[500px]">
        <DrawerHeader class="sr-only">
          <DrawerTitle>{{ $t('dashboard.filter_placeholder') }}</DrawerTitle>
        </DrawerHeader>
        <FilterComponent />
      </DrawerContent>
    </Drawer>

    <Button
      v-if="hasAnyFilter"
      variant="ghost"
      size="sm"
      class="h-7 px-2 text-xs text-muted-foreground"
      @click="clearAllFilters"
    >
      <X class="mr-1 h-3 w-3" />
      {{ $t('dashboard.clear_filters') }}
    </Button>
  </div>
</template>
