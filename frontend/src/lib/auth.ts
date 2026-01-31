import { auth } from './firebase'

import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

import {config} from 'core/config.js'

export const getPersistedLoginState = async (): Promise<{
  username: string
  userId: string
} | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe()
      if (user === null) {
        resolve(null)
      } else {
        resolve({ username: user.email || 'Unknown', userId: user.uid })
      }
    }, reject)
  })
}

export const signInUser = async (
  email: string,
  password: string,
): Promise<{ username: string; userId: string }> => {
  console.log('signing in with ', email, password)
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return { username: userCredential.user.email || 'Unknown', userId: userCredential.user.uid }
}

export const signOutUser = async (): Promise<void> => {
  await signOut(auth)
}

export const tokenGenerator = async () => {
  return await auth.currentUser?.getIdToken()
}
config.tokenGenerator = tokenGenerator

export const registerUser = async (username: string, password: string) => {
  const res = await fetch(`${import.meta.env['VITE_COUCH_HOST']}/register`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    headers: { 'Content-Type': 'application/json' },
  })
  if (res.ok) {
    const { userId } = await res.json()
    return userId
  } else {
    const { error } = await res.json()
    throw new Error(error.message)
  }
}
