import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Instant scroll — no animation
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
