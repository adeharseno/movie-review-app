<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const logout = async () => {
  auth.logout()
  await router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <span class="font-semibold">Movie Review</span>
        <button
          class="text-sm font-medium text-slate-600 hover:text-slate-900"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </header>
    <RouterView />
  </div>
</template>
