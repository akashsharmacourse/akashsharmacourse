import { getAuth } from 'firebase/auth'

export const adminFetch = async (url, options = {}) => {
  const auth = getAuth()
  const user = auth.currentUser
  const token = user ? await user.getIdToken() : ''

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  })
}
