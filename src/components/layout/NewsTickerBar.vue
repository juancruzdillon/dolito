<template>
  <div
    v-if="items.length"
    class="news-ticker border-b overflow-hidden"
    :style="{ background: 'var(--surface-2)', borderColor: 'var(--border)' }"
  >
    <div class="flex items-center h-8">
      <!-- Etiqueta fija -->
      <div
        class="flex-shrink-0 flex items-center gap-1.5 px-3 h-full border-r text-xs font-bold uppercase tracking-wider"
        :style="{ color: 'var(--brand)', borderColor: 'var(--border)', background: 'var(--surface)' }"
      >
        <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: var(--brand)"></span>
        Noticias
      </div>

      <!-- Ticker scrollable -->
      <div class="ticker-wrap flex-1 overflow-hidden relative">
        <div class="ticker-track flex items-center gap-0" :style="{ animationDuration: duration + 's' }">
          <span
            v-for="(item, i) in doubled"
            :key="i"
            class="ticker-item flex-shrink-0 flex items-center gap-2 text-xs px-5 cursor-pointer hover:opacity-80 transition-opacity"
            @click="open(item.link)"
          >
            <span class="font-semibold flex-shrink-0" style="color: var(--brand)">{{ item.source }}</span>
            <span :style="{ color: 'var(--text-2)' }">{{ item.title }}</span>
            <span class="ml-2 flex-shrink-0" style="color: var(--border-2)">›</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const items = ref([])

const BASE = 'https://api.rss2json.com/v1/api.json?rss_url='
const FEEDS = [
  'https://news.google.com/rss/search?q=dolar+economia+argentina&hl=es-419&gl=AR&ceid=AR:es-419',
  'https://news.google.com/rss/search?q=mercados+finanzas+economia+mundial&hl=es&gl=ES&ceid=ES:es',
]

function parseItems(data) {
  if (data.status !== 'ok' || !data.items?.length) return []
  return data.items.map(item => {
    const parts = item.title.split(' - ')
    const source = parts.length > 1 ? parts.pop().trim() : (item.author || 'Noticia')
    const title = parts.join(' - ').trim()
    return { title, source, link: item.link }
  })
}

async function fetchNews() {
  try {
    const results = await Promise.allSettled(
      FEEDS.map(url => fetch(BASE + encodeURIComponent(url)).then(r => r.json()))
    )

    const merged = []
    results.forEach(r => {
      if (r.status === 'fulfilled') merged.push(...parseItems(r.value))
    })

    // Interleave AR and global: sort by feed index alternately
    const ar = merged.slice(0, 10)
    const gl = merged.slice(10)
    const interleaved = []
    const max = Math.max(ar.length, gl.length)
    for (let i = 0; i < max; i++) {
      if (ar[i]) interleaved.push(ar[i])
      if (gl[i]) interleaved.push(gl[i])
    }

    if (interleaved.length) items.value = interleaved
  } catch {
    // silently ignore
  }
}

// Duplicate items for seamless loop
const doubled = computed(() => [...items.value, ...items.value])

const duration = computed(() => Math.max(60, items.value.length * 20))

function open(url) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

onMounted(() => {
  fetchNews()
  setInterval(fetchNews, 30 * 60 * 1000)
})
</script>

<style scoped>
.ticker-wrap {
  mask-image: linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%);
}

.ticker-track {
  display: flex;
  width: max-content;
  animation: ticker-scroll linear infinite;
  will-change: transform;
}

.ticker-track:hover {
  animation-play-state: paused;
}

@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
</style>
