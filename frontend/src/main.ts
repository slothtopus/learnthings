import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import DialogService from 'primevue/dialogservice'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import Aura from '@primeuix/themes/aura'

import '@/assets/main.css'

import { config } from 'core/config.js'
config.GENERATION_API_URL = import.meta.env['VITE_GENERATION_API_URL']

const app = createApp(App)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})
app.use(DialogService)
app.use(ToastService)
app.directive('tooltip', Tooltip)
app.use(router)

app.mount('#app')
