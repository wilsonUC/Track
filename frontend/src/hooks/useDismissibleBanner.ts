import { useState, useEffect, useCallback } from 'react'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export function useDismissibleBanner(storageKey: string, daysToExpiry = 7) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`banner_dismissed_${storageKey}`)
      if (!stored) {
        setIsVisible(true)
      } else {
        const dismissedTimestamp = parseInt(stored, 10)
        if (isNaN(dismissedTimestamp)) {
          setIsVisible(true)
        } else {
          const now = Date.now()
          const expiryTime = daysToExpiry * ONE_DAY_MS
          if (now - dismissedTimestamp > expiryTime) {
            setIsVisible(true)
            localStorage.removeItem(`banner_dismissed_${storageKey}`)
          } else {
            setIsVisible(false)
          }
        }
      }
    } catch {
      setIsVisible(true)
    } finally {
      setIsLoaded(true)
    }
  }, [storageKey, daysToExpiry])

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(`banner_dismissed_${storageKey}`, String(Date.now()))
    } catch {
      // ignore
    }
    setIsVisible(false)
  }, [storageKey])

  return { isVisible, isLoaded, dismiss }
}
