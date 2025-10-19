import { ref, computed } from 'vue'
import { getPersistedLoginState, signInUser, signOutUser, registerUser } from '@/lib/auth'

const user = ref<{ username: string; userId: string } | undefined>()
const username = computed(() => user.value?.username)
const userId = computed(() => user.value?.userId)
const signedIn = computed(() => user.value !== undefined && user.value.userId != 'guest')

const _initialiseAuth = async () => {
  const persistedUser = await getPersistedLoginState()
  if (persistedUser) {
    user.value = persistedUser
  } else {
    user.value = { username: 'Guest', userId: 'guest' }
  }
}
let initialisationPromise: Promise<void> | undefined

const initialiseAuth = async () => {
  if (initialisationPromise === undefined) {
    initialisationPromise = _initialiseAuth()
  }
  await initialisationPromise
}

const signIn = async (_username: string, password: string) => {
  const { username, userId } = await signInUser(_username, password)
  user.value = { username, userId }
}

const signOut = async () => {
  signOutUser()
  user.value = { username: 'Guest', userId: 'guest' }
}

const register = async (username: string, password: string) => {
  await registerUser(username, password)
  await signIn(username, password)
}

export const useAuth = () => {
  return { initialiseAuth, signIn, signOut, register, username, userId, signedIn }
}
