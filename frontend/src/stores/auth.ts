import { defineStore } from 'pinia'

import { apiClient, AUTH_TOKEN_KEY } from '../api/client'

type User = {
  id: string
  email: string
}

type LoginResponse = {
  success: true
  data: {
    token: string
    user: User
  }
}

type CurrentUserResponse = {
  success: true
  data: {
    user: User
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(AUTH_TOKEN_KEY) as string | null,
    user: null as User | null,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
  },
  actions: {
    async login(email: string, password: string) {
      const response = await apiClient.post<LoginResponse>('/auth/login', { email, password })

      this.token = response.data.data.token
      this.user = response.data.data.user
      localStorage.setItem(AUTH_TOKEN_KEY, this.token)
    },
    async initialize() {
      if (this.initialized) {
        return
      }

      if (this.token) {
        try {
          const response = await apiClient.get<CurrentUserResponse>('/auth/me')
          this.user = response.data.data.user
        } catch {
          this.clearSession()
        }
      }

      this.initialized = true
    },
    clearSession() {
      this.token = null
      this.user = null
      localStorage.removeItem(AUTH_TOKEN_KEY)
    },
    logout() {
      this.clearSession()
    },
  },
})
