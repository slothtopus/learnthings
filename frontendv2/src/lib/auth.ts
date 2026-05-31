import { auth } from './firebase'

import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

import { config } from 'core/config.js'

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
        const { claims } = await user.getIdTokenResult()
        const couchId = claims['couchId'] as string | undefined
        if (!couchId) {
          await signOut(auth)
          resolve(null)
        } else {
          resolve({ username: user.email || 'Unknown', userId: couchId })
        }
      }
    }, reject)
  })
}

export const signInUser = async (
  email: string,
  password: string,
): Promise<{ username: string }> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return { username: userCredential.user.email || 'Unknown' }
}

export const signOutUser = async (): Promise<void> => {
  await signOut(auth)
}

export const tokenGenerator = async () => {
  return await auth.currentUser?.getIdToken()
}
config.tokenGenerator = tokenGenerator

export const provisionUser = async (): Promise<string> => {
  const token = await auth.currentUser?.getIdToken()
  if (!token) throw new Error('No user signed in')
  const resp = await fetch(`${import.meta.env['VITE_COUCH_HOST']}/auth/provision`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!resp.ok) throw new Error(`Provisioning failed: ${resp.status}`)
  await auth.currentUser?.getIdToken(true)
  const { couchId } = await resp.json()
  return couchId as string
}

export const signInWithGoogle = async (): Promise<{ username: string }> => {
  const provider = new GoogleAuthProvider()
  const userCredential = await signInWithPopup(auth, provider)
  return { username: userCredential.user.email || 'Unknown' }
}

export const registerUser = async (username: string, password: string) => {
  const res = await fetch(`${import.meta.env['VITE_COUCH_HOST']}/auth/register`, {
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
