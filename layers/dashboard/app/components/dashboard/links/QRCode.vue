<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = withDefaults(defineProps<{
  data: string
  image?: string
}>(), {
  image: '',
})

const color = ref('#000000')
const qrCodeEl = ref<HTMLElement | null>(null)
let qrCode: any = null
const isReady = ref(false)

async function init() {
  if (!import.meta.client)
    return

  try {
    const { default: QRCodeStyling } = await import('qr-code-styling')

    qrCode = new QRCodeStyling({
      width: 260,
      height: 260,
      type: 'canvas',
      data: props.data,
      image: props.image || '/icon.png',
      margin: 10,
      qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'Q' },
      imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 2 },
      dotsOptions: { type: 'dots', color: color.value },
      backgroundOptions: { color: '#ffffff' },
      cornersSquareOptions: { type: 'extra-rounded', color: color.value },
      cornersDotOptions: { type: 'dot', color: color.value },
    })

    if (qrCodeEl.value) {
      qrCodeEl.value.innerHTML = ''
      qrCode.append(qrCodeEl.value)
      isReady.value = true
    }
  }
  catch (err) {
    console.error('Failed to initialize QR code:', err)
  }
}

function updateQr() {
  if (qrCode) {
    qrCode.update({
      data: props.data,
      image: props.image || '/icon.png',
      dotsOptions: { color: color.value },
      cornersSquareOptions: { color: color.value },
      cornersDotOptions: { color: color.value },
    })
  }
}

watch(color, () => {
  updateQr()
})

watch(() => props.data, () => {
  updateQr()
})

watch(() => props.image, () => {
  updateQr()
})

function downloadQRCode() {
  if (qrCode) {
    try {
      const slug = props.data.split('/').pop()
      qrCode.download({
        extension: 'png',
        name: `qr_${slug}`,
      })
    }
    catch {
      toast.error('Failed to download QR code')
    }
  }
}

onMounted(() => {
  nextTick(() => {
    setTimeout(init, 200)
  })
})
</script>

<template>
  <div class="flex flex-col items-center gap-4" @pointerdown.stop @click.stop>
    <div
      ref="qrCodeEl"
      class="
        flex min-h-[260px] min-w-[260px] items-center justify-center rounded-lg
        border bg-background p-1 shadow-sm
      "
    >
      <div v-if="!isReady" class="animate-pulse text-xs text-muted-foreground">
        Generating QR...
      </div>
    </div>
    <div class="flex items-center gap-4">
      <div class="relative flex items-center" @pointerdown.stop @click.stop>
        <div
          class="
            h-8 w-8 cursor-pointer overflow-hidden rounded-full border
            border-border
          "
          :style="{ backgroundColor: color }"
          :title="$t('links.change_qr_color')"
        >
          <input
            v-model="color"
            type="color"
            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            :title="$t('links.change_qr_color')"
            @pointerdown.stop
            @click.stop
          >
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        :disabled="!isReady"
        @click.stop="downloadQRCode"
      >
        <Download class="mr-2 h-4 w-4" />
        {{ $t('links.download_qr_code') }}
      </Button>
    </div>
  </div>
</template>
