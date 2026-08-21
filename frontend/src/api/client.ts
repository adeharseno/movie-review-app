import axios from 'axios'

export const AUTH_TOKEN_KEY = 'movieReviewAccessToken'

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const handleUnauthorizedResponses = (onUnauthorized: () => void) => {
  apiClient.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401 &&
        error.config?.url !== '/auth/login'
      ) {
        onUnauthorized()
      }

      return Promise.reject(error)
    },
  )
}
