<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const submit = async () => {
  if (isSubmitting.value) {
    return
  }

  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await auth.login(email.value, password.value)
    await router.push('/movies')
  } catch (error) {
    errorMessage.value =
      axios.isAxiosError(error) && error.response?.status === 401
        ? 'Email or password is incorrect.'
        : 'Unable to sign in. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
    <section class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <div class="mb-8">
        <p class="text-sm font-semibold uppercase tracking-wider text-amber-600">
          Movie Review
        </p>
        <h1 class="mt-2 text-2xl font-semibold text-slate-900">
          Sign in to your account
        </h1>
      </div>

      <form
        class="space-y-5"
        @submit.prevent="submit"
      >
        <div>
          <label
            for="email"
            class="mb-2 block text-sm font-medium text-slate-700"
          >Email</label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            autocomplete="email"
            required
            class="w-full rounded-md border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          >
        </div>

        <div>
          <label
            for="password"
            class="mb-2 block text-sm font-medium text-slate-700"
          >Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full rounded-md border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          >
        </div>

        <p
          v-if="errorMessage"
          role="alert"
          class="text-sm text-red-700"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full rounded-md bg-slate-900 px-4 py-2.5 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </section>
  </main>
</template>
