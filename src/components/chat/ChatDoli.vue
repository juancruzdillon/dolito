<template>
  <div class="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
    <!-- Chat Window -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-10 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-10 opacity-0 scale-95"
    >
      <div v-if="isOpen" class="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-slate-950 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="p-4 bg-slate-900 dark:bg-black flex items-center justify-between text-white border-b border-slate-800 dark:border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-900 flex items-center justify-center border border-slate-700 dark:border-slate-800">
              <Bot :size="20" class="text-emerald-400" />
            </div>
            <div>
              <p class="font-bold text-sm tracking-tight">Doli</p>
              <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">Ayudante</p>
            </div>
          </div>
          <button @click="isOpen = false" class="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X :size="18" />
          </button>
        </div>

        <!-- Messages -->
        <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-950 scroll-smooth">
          <div v-for="(m, i) in messages" :key="i" :id="'msg-' + i" class="flex" :class="m.role === 'user' ? 'justify-end' : 'justify-start'">
            <div 
              class="max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm doli-message-content"
              :class="m.role === 'user' 
                ? 'bg-emerald-600 dark:bg-emerald-700 text-white rounded-br-none' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'"
              v-html="renderMarkdown(m.content)"
            ></div>
          </div>
          <div v-if="isLoading" class="flex justify-start">
            <div class="bg-slate-100 dark:bg-slate-800 p-3.5 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-sm flex gap-1">
              <span class="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse"></span>
              <span class="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse [animation-delay:0.2s]"></span>
              <span class="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse [animation-delay:0.4s]"></span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form @submit.prevent="sendMessage" class="relative group">
            <input 
              ref="inputRef"
              v-model="input"
              type="text"
              placeholder="Preguntame lo que quieras..."
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl h-12 pl-4 pr-12 text-sm focus:ring-2 focus:ring-emerald-600 dark:focus:ring-emerald-700 focus:border-transparent transition-all dark:text-white"
              :disabled="isLoading"
            />
            <button 
              type="submit"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 dark:bg-emerald-700 text-white rounded-xl disabled:opacity-50 active:scale-95 transition-all"
              :disabled="isLoading || !input.trim()"
            >
              <Send :size="16" />
            </button>
          </form>
          <p class="text-[10px] text-center mt-3 text-slate-400 dark:text-slate-600 uppercase tracking-tighter font-bold">
            DOLITO • AI AGENT
          </p>
        </div>
      </div>
    </Transition>

    <!-- Toggle Button -->
    <button 
      @click="toggleChat" 
      class="w-14 h-14 bg-slate-900 dark:bg-emerald-700 text-white rounded-full shadow-lg border border-slate-700 dark:border-emerald-600/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden"
    >
      <Transition mode="out-in">
        <MessageSquare v-if="!isOpen" key="open" :size="24" class="group-hover:-translate-y-0.5 transition-transform" />
        <ChevronDown v-else key="close" :size="24" />
      </Transition>
    </button>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { Bot, X, Send, MessageSquare, ChevronDown } from 'lucide-vue-next'
import { useDolarStore } from '@/stores/dolar.js'
import { useBrokersStore } from '@/stores/brokers.js'
import showdown from 'showdown'

const dolarStore   = useDolarStore()
const brokersStore = useBrokersStore()
const converter    = new showdown.Converter({
  simplifiedAutoLink: true,
  strikethrough: true,
  tables: true
})

const isOpen    = ref(false)
const isLoading = ref(false)
const input     = ref('')
const messages  = ref([])
const inputRef = ref(null)
const chatContainer = ref(null)

// Persistent history — versioned key forces a fresh start
const CACHE_KEY = 'doli_chat_history_v2026'

const renderMarkdown = (text) => {
  return converter.makeHtml(text)
}

onMounted(() => {
  const cached = sessionStorage.getItem(CACHE_KEY)
  if (cached) {
    messages.value = JSON.parse(cached)
  } else {
    // Initial greeting
    messages.value = [
      { role: 'model', content: '¡Hola! Soy Doli, te voy a ayudar con tus dudas financieras en Dolito. 📈\n\n¿En qué puedo ayudarte hoy? Puedo explicarte sobre el dólar blue, MEP, inversiones en pesos o cómo empezar a cuidar tus ahorros.' }
    ]
  }
})

// Toggle and scroll
const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    scrollToBottom()
    nextTick(() => inputRef.value?.focus())
  }
}

watch(messages, () => {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(messages.value))
  scrollToMessage()
}, { deep: true })

const scrollToMessage = async () => {
  await nextTick()
  if (!chatContainer.value || messages.value.length === 0) return

  const lastIndex = messages.value.length - 1
  const lastMsg = messages.value[lastIndex]
  const element = document.getElementById('msg-' + lastIndex)

  if (element) {
    if (lastMsg.role === 'model') {
      // Scroll so the top of Doli's response is visible
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      // For user messages, stick to the bottom
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!input.value.trim() || isLoading.value) return

  const userMessage = { role: 'user', content: input.value.trim() }
  messages.value.push(userMessage)
  input.value = ''
  isLoading.value = true

  // Gather market context for Doli
  const marketData = {
    cotizaciones: dolarStore.rates.map(r => ({
      casa: r.casa,
      nombre: r.nombre,
      venta: r.venta,
      compra: r.compra
    })),
    mejorOpcion: dolarStore.bestBuyRate?.nombre,
    fecha: new Date().toLocaleDateString('es-AR'),
    hora: dolarStore.lastUpdated
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.value,
        marketData
      })
    })

    if (!response.ok) throw new Error('Error al conectar con Doli')

    const data = await response.json()
    messages.value.push({ role: 'model', content: data.content })
  } catch (e) {
    messages.value.push({ role: 'model', content: '¡Uf! Parece que tuve un cortocircuito. ¿Podrías intentar preguntarme de nuevo?' })
  } finally {
    isLoading.value = false
    nextTick(() => inputRef.value?.focus())
  }
}
</script>

<style scoped>
/* Scoped styles if needed for standard scrollbar or other tweaks */
::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
}
.dark ::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
}

:deep(.doli-message-content) p {
  margin-bottom: 0.5rem;
}
:deep(.doli-message-content) p:last-child {
  margin-bottom: 0;
}
:deep(.doli-message-content) strong {
  font-weight: 700;
}
:deep(.doli-message-content) ul {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
}
</style>
