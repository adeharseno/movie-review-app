<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'

import { apiClient } from '../api/client'

type Movie = {
  imdbId: string
  title: string
  year: string
  type: string
  poster: string | null
}

type SearchResponse = {
  success: true
  data: {
    movies: Movie[]
    pagination: {
      page: number
      totalResults: number
      totalPages: number
    }
  }
}

const query = ref('')
const activeQuery = ref('')
const movies = ref<Movie[]>([])
const page = ref(1)
const totalPages = ref(0)
const totalResults = ref(0)
const isLoading = ref(false)
const hasSearched = ref(false)
const errorMessage = ref('')
const failedPosters = ref(new Set<string>())

const search = async (targetPage = 1, searchQuery = query.value) => {
  const trimmedQuery = searchQuery.trim()

  if (!trimmedQuery || isLoading.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  movies.value = []
  failedPosters.value.clear()

  try {
    const response = await apiClient.get<SearchResponse>('/movies/search', {
      params: { q: trimmedQuery, page: targetPage },
    })

    activeQuery.value = trimmedQuery
    movies.value = response.data.data.movies
    page.value = response.data.data.pagination.page
    totalPages.value = response.data.data.pagination.totalPages
    totalResults.value = response.data.data.pagination.totalResults
    hasSearched.value = true
  } catch (error) {
    if (!(axios.isAxiosError(error) && error.response?.status === 401)) {
      errorMessage.value = 'Unable to load movies. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

const previousPage = () => {
  if (page.value > 1) {
    void search(page.value - 1, activeQuery.value)
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    void search(page.value + 1, activeQuery.value)
  }
}
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
    <div class="max-w-2xl">
      <h1 class="text-2xl font-semibold">
        Movies
      </h1>
      <form
        class="mt-6 flex flex-col gap-3 sm:flex-row"
        @submit.prevent="search(1)"
      >
        <label
          for="movie-search"
          class="sr-only"
        >Search movies</label>
        <input
          id="movie-search"
          v-model="query"
          type="search"
          placeholder="Search by title"
          class="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        >
        <button
          type="submit"
          :disabled="isLoading || !query.trim()"
          class="rounded-md bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isLoading ? 'Searching…' : 'Search' }}
        </button>
      </form>
    </div>

    <p
      v-if="isLoading"
      class="mt-10 text-slate-600"
      role="status"
    >
      Loading movies…
    </p>

    <div
      v-else-if="errorMessage"
      class="mt-10 rounded-md border border-red-200 bg-red-50 p-4 text-red-800"
      role="alert"
    >
      <p>{{ errorMessage }}</p>
      <button
        class="mt-3 text-sm font-semibold underline"
        @click="search(page, activeQuery || query)"
      >
        Try again
      </button>
    </div>

    <p
      v-else-if="!hasSearched"
      class="mt-10 text-slate-600"
    >
      Search for a movie to get started.
    </p>

    <p
      v-else-if="movies.length === 0"
      class="mt-10 text-slate-600"
    >
      No movies found for “{{ activeQuery }}”.
    </p>

    <template v-else>
      <p class="mt-8 text-sm text-slate-600">
        {{ totalResults }} results for “{{ activeQuery }}”
      </p>

      <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <RouterLink
          v-for="movie in movies"
          :key="movie.imdbId"
          :to="`/movies/${movie.imdbId}`"
          class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <div class="aspect-[2/3] bg-slate-200">
            <img
              v-if="movie.poster && !failedPosters.has(movie.imdbId)"
              :src="movie.poster"
              :alt="`${movie.title} poster`"
              class="h-full w-full object-cover"
              loading="lazy"
              @error="failedPosters.add(movie.imdbId)"
            >
            <div
              v-else
              class="flex h-full items-center justify-center px-3 text-center text-sm text-slate-500"
            >
              No poster available
            </div>
          </div>
          <div class="p-3">
            <h2 class="font-semibold leading-snug text-slate-900">
              {{ movie.title }}
            </h2>
            <p class="mt-1 text-sm text-slate-600">
              {{ movie.year }} · {{ movie.type }}
            </p>
          </div>
        </RouterLink>
      </div>

      <nav
        v-if="totalPages > 1"
        class="mt-8 flex items-center justify-between border-t border-slate-200 pt-5"
        aria-label="Search results pages"
      >
        <button
          :disabled="page === 1 || isLoading"
          class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          @click="previousPage"
        >
          Previous
        </button>
        <span class="text-sm text-slate-600">Page {{ page }} of {{ totalPages }}</span>
        <button
          :disabled="page === totalPages || isLoading"
          class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          @click="nextPage"
        >
          Next
        </button>
      </nav>
    </template>
  </main>
</template>
