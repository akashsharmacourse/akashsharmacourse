import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Single device session check
        const sessionId = localStorage.getItem('sessionId')
        const userRef = doc(db, 'users', firebaseUser.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const data = userSnap.data()

          // If another device is logged in
          if (data.activeSessionId && data.activeSessionId !== sessionId) {
            // Only block if sessionId exists in localStorage
            // First time login — sessionId not set yet — allow
            const existingSession = localStorage.getItem('sessionId')
            if (existingSession && data.activeSessionId !== existingSession) {
              await signOut(auth)
              localStorage.removeItem('sessionId')
              setUser(null)
              setUserData(null)
              setLoading(false)
              // Replace alert with a state-based message — no browser alert
              setSessionError('You have been logged out. Another device is currently logged in.')
              return
            }
          }

          // 30 days expiry check
          if (data.accessExpiresAt) {
            const expiry = new Date(data.accessExpiresAt)
            const now = new Date()
            if (now > expiry && data.hasAccess !== false) {
              // Access expired — revoke
              await updateDoc(doc(db, 'users', firebaseUser.uid), {
                hasAccess: false
              })
              data.hasAccess = false
              console.log('Access expired for:', firebaseUser.email)
            }
          }

          setUserData(data)
        }
        setUser(firebaseUser)
      } else {
        setUser(null)
        setUserData(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const login = async (email, password) => {
    // Clear previous session errors on login attempt
    setSessionError('')
    const result = await signInWithEmailAndPassword(auth, email, password)

    // Generate session ID — single device lock
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem('sessionId', sessionId)

    // Save session to Firestore
    await setDoc(
      doc(db, 'users', result.user.uid),
      { activeSessionId: sessionId, lastLogin: new Date().toISOString() },
      { merge: true }
    )

    return result
  }

  const logout = async () => {
    if (user) {
      // Clear session from Firestore
      await setDoc(
        doc(db, 'users', user.uid),
        { activeSessionId: null },
        { merge: true }
      )
    }
    localStorage.removeItem('sessionId')
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, logout, sessionError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
