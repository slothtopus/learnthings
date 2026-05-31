<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import AppButton from '@/components/used/AppButton.vue'
import AppInput from '@/components/used/AppInput.vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { signIn, signInWithGoogle, register } = useAuth()

const mode = ref<'signin' | 'register'>('signin')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref<string | undefined>()
const loading = ref(false)

const switchMode = (to: typeof mode.value) => {
  mode.value = to
  error.value = undefined
  password.value = ''
  confirmPassword.value = ''
}

const submitDisabled = computed(() => {
  if (loading.value || !email.value || !password.value) return true
  if (mode.value === 'register' && password.value !== confirmPassword.value) return true
  return false
})

const nextRoute = () => {
  const next = router.currentRoute.value.query['next']
  return (Array.isArray(next) ? next[0] : next) ?? '/'
}

const handleSubmit = async () => {
  error.value = undefined
  loading.value = true
  try {
    if (mode.value === 'register') {
      await register(email.value, password.value)
    } else {
      await signIn(email.value, password.value)
    }
    router.push(nextRoute())
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong.'
  } finally {
    loading.value = false
  }
}

const handleGoogleSignIn = async () => {
  error.value = undefined
  loading.value = true
  try {
    await signInWithGoogle()
    router.push(nextRoute())
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Google sign in failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="fixed inset-0 flex flex-col items-center justify-center px-6"
    style="background: radial-gradient(circle at top left, #1c1f22 0%, #0c0e10 100%)"
  >
    <!-- Wordmark -->
    <div class="flex flex-col items-center gap-3 mb-12">
      <span class="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">learnthings</span>
      <h1 class="text-4xl font-extralight tracking-wide text-on-surface">
        {{ mode === 'signin' ? 'Sign in' : 'Register' }}
      </h1>
    </div>

    <!-- Card -->
    <div class="w-full max-w-sm space-y-4">
      <!-- Google button (sign-in only) -->
      <template v-if="mode === 'signin'">
        <button
          class="w-full h-11 flex items-center justify-center gap-3 rounded-xs border border-white/10 text-on-surface hover:bg-white/5 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          :disabled="loading"
          @click="handleGoogleSignIn"
        >
          <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span class="text-[10px] font-bold uppercase tracking-widest">Continue with Google</span>
        </button>

        <div class="flex items-center gap-4">
          <div class="flex-1 h-px bg-white/5" />
          <span class="text-[10px] font-light text-on-surface/30 uppercase tracking-widest">or</span>
          <div class="flex-1 h-px bg-white/5" />
        </div>
      </template>

      <!-- Fields -->
      <div class="space-y-3">
        <AppInput v-model="email" label="Email" placeholder="you@example.com" icon="mail" />
        <AppInput v-model="password" label="Password" placeholder="••••••••" icon="lock" />
        <AppInput
          v-if="mode === 'register'"
          v-model="confirmPassword"
          label="Confirm Password"
          placeholder="••••••••"
          icon="lock"
        />
      </div>

      <!-- Password mismatch hint -->
      <p
        v-if="mode === 'register' && confirmPassword && password !== confirmPassword"
        class="text-[10px] text-red-400 font-light"
      >
        Passwords do not match.
      </p>

      <!-- Error -->
      <p v-if="error" class="text-xs text-red-400 font-light">{{ error }}</p>

      <!-- Submit -->
      <AppButton size="lg" class="w-full" :disabled="submitDisabled" @click="handleSubmit">
        {{ loading ? '…' : mode === 'signin' ? 'Sign in' : 'Create account' }}
      </AppButton>

      <!-- Mode toggle -->
      <p class="text-center text-xs font-light text-on-surface/40">
        {{ mode === 'signin' ? "Don't have an account?" : 'Already have an account?' }}
        <button
          class="text-primary hover:underline cursor-pointer ml-1"
          @click="switchMode(mode === 'signin' ? 'register' : 'signin')"
        >
          {{ mode === 'signin' ? 'Register' : 'Sign in' }}
        </button>
      </p>
    </div>
  </div>
</template>
