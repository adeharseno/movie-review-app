<script setup lang="ts">
import axios from 'axios'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { apiClient } from '../api/client'

type Movie = {
  imdbId: string
  title: string
  year: string
  rated: string | null
  runtime: string | null
  genre: string | null
  director: string | null
  actors: string | null
  plot: string | null
  poster: string | null
  imdbRating: string | null
}

type DetailResponse = {
  success: true
  data: { movie: Movie; userScore: number | null }
}

type ScoreResponse = {
  success: true
  data: { score: number }
}

type ErrorResponse = {
  success: false
  error: { code: string }
}

const route = useRoute()
const movie = ref<Movie | null>(null)
const confirmedScore = ref<number | null>(null)
const selectedScore = ref<number | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)
const loadError = ref<'not-found' | 'request' | null>(null)
const scoreError = ref('')
const posterFailed = ref(false)

const loadMovie = async () => {
  const imdbId = String(route.params.imdbId)
  isLoading.value = true
  movie.value = null
  loadError.value = null
  scoreError.value = ''
  posterFailed.value = false

  try {
    const response = await apiClient.get<DetailResponse>(`/movies/${imdbId}`)
    movie.value = response.data.data.movie
    confirmedScore.value = response.data.data.userScore
    selectedScore.value = response.data.data.userScore
  } catch (error) {
    if (axios.isAxiosError<ErrorResponse>(error) && error.response?.status === 404) {
      loadError.value = 'not-found'
    } else if (!(axios.isAxiosError(error) && error.response?.status === 401)) {
      loadError.value = 'request'
    }
  } finally {
    isLoading.value = false
  }
}

const saveScore = async () => {
  if (selectedScore.value === null || isSaving.value) return

  isSaving.value = true
  scoreError.value = ''

  try {
    const response = await apiClient.put<ScoreResponse>(`/movies/${route.params.imdbId}/score`, {
      score: selectedScore.value,
    })
    confirmedScore.value = response.data.data.score
    selectedScore.value = response.data.data.score
  } catch (error) {
    if (!(axios.isAxiosError(error) && error.response?.status === 401)) {
      scoreError.value = 'Unable to save your score. Please try again.'
    }
  } finally {
    isSaving.value = false
  }
}

watch(() => route.params.imdbId, loadMovie, { immediate: true })
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
    <RouterLink
      to="/movies"
      class="text-sm font-medium text-slate-600 hover:text-slate-900"
    >
      ← Back to movies
    </RouterLink>

    <p
      v-if="isLoading"
      class="mt-10 text-slate-600"
      role="status"
    >
      Loading movie details…
    </p>

    <section
      v-else-if="loadError === 'not-found'"
      class="mt-10"
    >
      <h1 class="text-2xl font-semibold">
        Movie not found.
      </h1>
      <p class="mt-2 text-slate-600">
        The requested movie could not be found.
      </p>
    </section>

    <section
      v-else-if="loadError === 'request'"
      class="mt-10 rounded-md border border-red-200 bg-red-50 p-5 text-red-800"
      role="alert"
    >
      <p>Unable to load movie details. Please try again.</p>
      <button
        class="mt-3 text-sm font-semibold underline"
        @click="loadMovie"
      >
        Try again
      </button>
    </section>

    <template v-else-if="movie">
      <div class="mt-8 grid gap-8 md:grid-cols-[240px_1fr] lg:gap-10">
        <div class="mx-auto aspect-[2/3] w-full max-w-60 overflow-hidden rounded-lg bg-slate-200 md:mx-0">
          <img
            v-if="movie.poster && !posterFailed"
            :src="movie.poster"
            :alt="`${movie.title} poster`"
            class="h-full w-full object-cover"
            @error="posterFailed = true"
          >
          <div
            v-else
            class="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500"
          >
            No poster available
          </div>
        </div>

        <div>
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 class="text-3xl font-semibold tracking-tight text-slate-950">
              {{ movie.title }}
            </h1>
            <span class="text-lg text-slate-500">{{ movie.year }}</span>
          </div>

          <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            <span v-if="movie.rated">{{ movie.rated }}</span>
            <span v-if="movie.runtime">{{ movie.runtime }}</span>
            <span v-if="movie.genre">{{ movie.genre }}</span>
          </div>

          <p
            v-if="movie.plot"
            class="mt-6 max-w-3xl leading-7 text-slate-700"
          >
            {{ movie.plot }}
          </p>

          <dl class="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div v-if="movie.director">
              <dt class="font-medium text-slate-900">
                Director
              </dt>
              <dd class="mt-1 text-slate-600">
                {{ movie.director }}
              </dd>
            </div>
            <div v-if="movie.actors">
              <dt class="font-medium text-slate-900">
                Cast
              </dt>
              <dd class="mt-1 text-slate-600">
                {{ movie.actors }}
              </dd>
            </div>
            <div v-if="movie.imdbRating">
              <dt class="font-medium text-slate-900">
                IMDb rating
              </dt>
              <dd class="mt-1 text-slate-600">
                {{ movie.imdbRating }} / 10
              </dd>
            </div>
          </dl>

          <section class="mt-8 border-t border-slate-200 pt-6">
            <h2 class="text-lg font-semibold">
              Your score
            </h2>
            <p class="mt-1 text-sm text-slate-600">
              {{ confirmedScore === null ? 'Not rated yet' : `${confirmedScore} / 10` }}
            </p>

            <div
              class="mt-4 grid max-w-xl grid-cols-5 gap-2 sm:grid-cols-10"
              aria-label="Choose a score from 1 to 10"
            >
              <button
                v-for="score in 10"
                :key="score"
                type="button"
                class="min-h-11 rounded-md border text-sm font-semibold transition"
                :class="selectedScore === score ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'"
                :aria-pressed="selectedScore === score"
                @click="selectedScore = score"
              >
                {{ score }}
              </button>
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                :disabled="selectedScore === null || selectedScore === confirmedScore || isSaving"
                class="rounded-md bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                @click="saveScore"
              >
                {{ isSaving ? 'Saving…' : 'Save score' }}
              </button>
              <p
                v-if="scoreError"
                class="text-sm text-red-700"
                role="alert"
              >
                {{ scoreError }}
              </p>
            </div>
          </section>
        </div>
      </div>
    </template>
  </main>
</template>
