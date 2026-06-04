// ============================================================
// useLiveQueue — QueueAI
// Polls places from the FastAPI backend so live queue counts,
// wait times, and status changes come from Supabase-backed data.
//
// Usage:
//   const { livePlaces, lastUpdated, isUpdating, loading, error,
//           reload } = useLiveQueue(addNotification)
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { placesApi } from '../api/client'

// How often to "refresh" the queue data (milliseconds)
const UPDATE_INTERVAL = 8000 // every 8 seconds

const useLiveQueue = (addNotification) => {
  const [livePlaces, setLivePlaces] = useState([])
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isUpdating, setIsUpdating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Track previous statuses to detect changes for notifications
  const prevStatusRef = useRef({})

  // Fetch latest places from the backend
  const reload = useCallback(async () => {
    setError('')
    try {
      setIsUpdating(true)
      const data = await placesApi.list()
      const places = (data || []).map((p) => ({ ...p }))
      places.forEach((place) => {
        const oldStatus = prevStatusRef.current[place.id]
        if (oldStatus && oldStatus !== place.status && addNotification) {
          if (place.status === 'busy') {
            addNotification({
              type: 'alert',
              icon: '🔴',
              message: `${place.name} is now busy — ~${place.estimatedWait} wait.`,
            })
          } else if (place.status === 'low') {
            addNotification({
              type: 'update',
              icon: '🟢',
              message: `${place.name} now has a short wait — ${place.currentQueue} in queue!`,
            })
          } else if (place.status === 'moderate' && oldStatus === 'busy') {
            addNotification({
              type: 'info',
              icon: '🟡',
              message: `${place.name} is getting less busy — ${place.estimatedWait} wait.`,
            })
          }
        }
      })
      setLivePlaces(places)
      prevStatusRef.current = places.reduce(
        (acc, p) => ({ ...acc, [p.id]: p.status }),
        {}
      )
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message || 'Could not load places.')
    } finally {
      setLoading(false)
      setIsUpdating(false)
    }
  }, [addNotification])

  useEffect(() => {
    reload()
  }, [reload])

  // Server-backed live refresh
  useEffect(() => {
    if (loading || error) return

    const interval = setInterval(reload, UPDATE_INTERVAL)
    return () => clearInterval(interval)
  }, [loading, error, reload])

  return { livePlaces, lastUpdated, isUpdating, loading, error, reload }
}

export default useLiveQueue
