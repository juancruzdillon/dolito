<template>
  <Transition name="loader-fade">
    <div v-if="show" class="loader-overlay">
      <div class="loader-content">
        <!-- Logo con pulse -->
        <div class="logo-pulse">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
            <rect width="48" height="48" rx="14" fill="#0EA47A"/>
            <path d="M24 8 V40" stroke="white" stroke-width="4.5" stroke-linecap="round"/>
            <path d="M31 16 C31 11.5, 17 11.5, 17 19 C17 26.5, 31 24.5, 31 31 C31 38.5, 17 38.5, 17 34" stroke="white" stroke-width="4.5" stroke-linecap="round" fill="none"/>
          </svg>
        </div>

        <!-- Nombre -->
        <div class="logo-name">
          <span class="logo-text-dark">dol</span><span class="logo-text-brand">ito</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({ show: Boolean })
</script>

<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.logo-pulse {
  animation: logo-breathe 1.4s ease-in-out infinite;
}

.logo-svg {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: block;
}

.logo-name {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
}

.logo-text-dark  { color: var(--text); }
.logo-text-brand { color: #0EA47A; }

@keyframes logo-breathe {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 0px rgba(14, 164, 122, 0));
  }
  50% {
    transform: scale(1.08);
    filter: drop-shadow(0 0 14px rgba(14, 164, 122, 0.55));
  }
}

/* Fade out al desaparecer */
.loader-fade-leave-active { transition: opacity 0.35s ease; }
.loader-fade-leave-to     { opacity: 0; }
</style>
