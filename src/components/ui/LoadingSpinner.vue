<template>
  <div class="flex flex-col items-center justify-center gap-3 py-12">
    <div class="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
    <p v-if="text" class="text-sm text-slate-400">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({ text: { type: String, default: '' } })
</script>
