<script setup lang="ts">
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div
    v-if="!auth.initialized"
    class="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600"
  >
    Loading…
  </div>
  <RouterView v-else />
</template>
