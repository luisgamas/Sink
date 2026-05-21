<script setup lang="ts">
import { CloudUpload } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const isBackingUp = ref(false)

async function handleBackup() {
  isBackingUp.value = true

  try {
    await useAPI('/api/backup', {
      method: 'POST',
    })

    toast.success(t('migrate.backup.success'))
  }
  catch (error) {
    toast.error(t('migrate.backup.failed'), {
      description: error instanceof Error ? error.message : String(error),
    })
  }
  finally {
    isBackingUp.value = false
  }
}
</script>

<template>
  <Card class="h-fit">
    <CardHeader>
      <CardTitle>{{ $t('migrate.backup.title') }}</CardTitle>
      <CardDescription>{{ $t('migrate.backup.description') }}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button :disabled="isBackingUp" @click="handleBackup">
        <Spinner v-if="isBackingUp" class="mr-2" />
        <CloudUpload v-else class="mr-2 h-4 w-4" />
        <template v-if="isBackingUp">
          {{ $t('migrate.backup.backing_up') }}
        </template>
        <template v-else>
          {{ $t('migrate.backup.button') }}
        </template>
      </Button>
    </CardContent>
  </Card>
</template>
