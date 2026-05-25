<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { getLibraryColorClasses } from '@/utils/library'

const route = useRoute()
const router = useRouter()
const metadataStore = useMetadataStore()

const activeFolder = computed(() => route.query.folder as string | undefined)
const activeTag = computed(() => route.query.tag as string | undefined)
const hasActiveFilters = computed(() => !!activeFolder.value || !!activeTag.value)

function setFilter(type: 'folder' | 'tag', value: string) {
  const query = { ...route.query }
  if (value === 'all') {
    delete query[type]
  }
  else {
    query[type] = value
  }
  router.replace({ query })
}

function clearFilters() {
  const query = { ...route.query }
  delete query.folder
  delete query.tag
  router.replace({ query })
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Select
      :model-value="activeFolder || 'all'"
      @update:model-value="v => setFilter('folder', v as string)"
    >
      <SelectTrigger class="h-8 w-[140px] text-xs">
        <SelectValue :placeholder="$t('links.filter_folder')" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all" class="text-xs text-muted-foreground italic">
            {{ $t('links.filter_all_folders') }}
          </SelectItem>
          <SelectItem
            v-for="f in metadataStore.folders" :key="f.name"
            :value="f.name"
            class="text-xs"
          >
            <div class="flex items-center gap-2">
              <span
                :class="cn('size-2 shrink-0 rounded-full border', getLibraryColorClasses(f.color))"
              />
              {{ f.name }}
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>

    <Select
      :model-value="activeTag || 'all'"
      @update:model-value="v => setFilter('tag', v as string)"
    >
      <SelectTrigger class="h-8 w-[140px] text-xs">
        <SelectValue :placeholder="$t('links.filter_tag')" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all" class="text-xs text-muted-foreground italic">
            {{ $t('links.filter_all_tags') }}
          </SelectItem>
          <SelectItem
            v-for="t in metadataStore.tags" :key="t.name"
            :value="t.name"
            class="text-xs"
          >
            <div class="flex items-center gap-2">
              <span
                :class="cn('size-2 shrink-0 rounded-full border', getLibraryColorClasses(t.color))"
              />
              {{ t.name }}
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>

    <Button
      v-if="hasActiveFilters"
      variant="ghost"
      size="sm"
      class="h-8 gap-1 px-2 text-xs text-muted-foreground"
      @click="clearFilters"
    >
      <X class="size-3" />
      {{ $t('links.filter_clear') }}
    </Button>
  </div>
</template>
