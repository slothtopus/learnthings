// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADN3neFvxJd8TMHvpLGfwukHOufUOeCHU",
  authDomain: "learnthings-app.firebaseapp.com",
  projectId: "learnthings-app",
  storageBucket: "learnthings-app.firebasestorage.app",
  messagingSenderId: "880959319287",
  appId: "1:880959319287:web:a97904f37cd84728b3f7f2"
};

// Initialize Firebase
const USE_LOCAL_AUTH = import.meta.env['VITE_USE_AUTH_EMULATOR'] === 'true'
console.log('USE_LOCAL_AUTH=', USE_LOCAL_AUTH)
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
if (USE_LOCAL_AUTH) {
  connectAuthEmulator(auth, 'http://localhost:9099')
}

export { auth }
