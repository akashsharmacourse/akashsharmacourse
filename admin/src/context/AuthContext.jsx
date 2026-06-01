import { createContext, useContext, useEffect, useState } from 'react'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verify admin role in Firestore
        const adminRef = doc(db, 'admins', user.uid)
        const adminSnap = await getDoc(adminRef)
        if (adminSnap.exists()) {
          setAdmin({ uid: user.uid, email: user.email, ...adminSnap.data() })
        } else {
          // Not an admin — sign out
          await signOut(auth)
          setAdmin(null)
        }
      } else {
        setAdmin(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    
    // Debug — check karo console mein
    console.log('Logged in UID:', result.user.uid)
    
    const adminRef = doc(db, 'admins', result.user.uid)
    const adminSnap = await getDoc(adminRef)
    
    console.log('Admin doc exists:', adminSnap.exists())
    console.log('Admin doc data:', adminSnap.data())
    
    if (!adminSnap.exists()) {
      await signOut(auth)
      throw new Error('Not authorized as admin')
    }
    return result
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
