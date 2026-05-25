<script setup lang="ts">
import { FolderOpen, Tags } from 'lucide-vue-next'
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
    <SidebarGroupLabel>{{ $t('nav.folders') }}</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          as-child
          :tooltip="$t('dashboard.library.manage_folders')"
          :is-active="route.path === '/dashboard/folders'"
        >
          <NuxtLink to="/dashboard/folders">
            <FolderOpen />
            <span>{{ $t('dashboard.library.manage_folders') }}</span>
          </NuxtLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuSub v-if="folders.length > 0">
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
      </SidebarMenuSub>
    </SidebarMenu>
  </SidebarGroup>

  <SidebarGroup>
    <SidebarGroupLabel>{{ $t('nav.tags') }}</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          as-child
          :tooltip="$t('dashboard.library.manage_tags')"
          :is-active="route.path === '/dashboard/tags'"
        >
          <NuxtLink to="/dashboard/tags">
            <Tags />
            <span>{{ $t('dashboard.library.manage_tags') }}</span>
          </NuxtLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuSub v-if="tags.length > 0">
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
      </SidebarMenuSub>
    </SidebarMenu>
  </SidebarGroup>
</template>
