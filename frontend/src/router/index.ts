import { createRouter, createWebHistory } from 'vue-router'

import AuthenticatedLayout from '../layouts/AuthenticatedLayout.vue'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import MovieDetailView from '../views/MovieDetailView.vue'
import MoviesView from '../views/MoviesView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/',
      component: AuthenticatedLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/movies' },
        { path: 'movies', name: 'movies', component: MoviesView },
        { path: 'movies/:imdbId', name: 'movie-detail', component: MovieDetailView },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.initialize()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'movies' }
  }
})

export default router
