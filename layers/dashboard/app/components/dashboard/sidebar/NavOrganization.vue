<script setup lang="ts">
import { ChevronRight, Folder, Tag } from 'lucide-vue-next'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { getLibraryColorClasses } from '@/utils/library'

defineProps<{
  folders: { name: string, color: string }[]
  tags: { name: string, color: string }[]
}>()

const route = useRoute()
const { isMobile, setOpenMobile } = useSidebar()

watch(() => route.fullPath, () => {
  if (isMobile.value) {
    setOpenMobile(false)
  }
})
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>{{ $t('nav.extras') }}</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem>
        <Collapsible class="group/collapsible w-full">
          <CollapsibleTrigger as-child>
            <SidebarMenuButton
              as-child
              :tooltip="$t('nav.folders')"
              :is-active="route.path === '/dashboard/folders'"
            >
              <NuxtLink to="/dashboard/folders">
                <Folder />
                <span>{{ $t('nav.folders') }}</span>
                <ChevronRight
                  class="
                    ml-auto transition-transform
                    group-data-[state=open]/collapsible:rotate-90
                  "
                />
              </NuxtLink>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem v-for="folder in folders" :key="folder.name">
                <SidebarMenuSubButton
                  as-child
                  :is-active="route.query.folder === folder.name"
                >
                  <NuxtLink
                    :to="{ path: '/dashboard/links', query: { folder: folder.name } }"
                  >
                    <span
                      :class="cn('mr-2 size-2 shrink-0 rounded-full border', getLibraryColorClasses(folder.color))"
                    />
                    <span class="truncate">{{ folder.name }}</span>
                  </NuxtLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem v-if="folders.length === 0">
                <SidebarMenuSubButton disabled class="cursor-default opacity-50">
                  <span class="text-xs italic">{{ $t('dashboard.extras.no_folders') }}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Collapsible class="group/collapsible w-full">
          <CollapsibleTrigger as-child>
            <SidebarMenuButton
              as-child
              :tooltip="$t('nav.tags')"
              :is-active="route.path === '/dashboard/tags'"
            >
              <NuxtLink to="/dashboard/tags">
                <Tag />
                <span>{{ $t('nav.tags') }}</span>
                <ChevronRight
                  class="
                    ml-auto transition-transform
                    group-data-[state=open]/collapsible:rotate-90
                  "
                />
              </NuxtLink>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem v-for="tag in tags" :key="tag.name">
                <SidebarMenuSubButton
                  as-child
                  :is-active="route.query.tag === tag.name"
                >
                  <NuxtLink
                    :to="{ path: '/dashboard/links', query: { tag: tag.name } }"
                  >
                    <span
                      :class="cn('mr-2 size-2 shrink-0 rounded-full border', getLibraryColorClasses(tag.color))"
                    />
                    <span class="truncate">{{ tag.name }}</span>
                  </NuxtLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem v-if="tags.length === 0">
                <SidebarMenuSubButton disabled class="cursor-default opacity-50">
                  <span class="text-xs italic">{{ $t('dashboard.extras.no_tags') }}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
