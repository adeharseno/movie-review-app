import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { handleUnauthorizedResponses } from './api/client'
import router from './router'
import { useAuthStore } from './stores/auth'
import './styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const auth = useAuthStore(pinia)

handleUnauthorizedResponses(() => {
  auth.clearSession()

  if (router.currentRoute.value.name !== 'login') {
    void router.push({ name: 'login' })
  }
})

app.mount('#app')
