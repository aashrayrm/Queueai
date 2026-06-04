// ============================================================
// useNotifications — QueueAI
// Custom hook that manages the global notification list.
// Loads and persists notifications through the backend when available.
// Usage: const { notifications, unreadCount, addNotification,
//               markAllRead, clearAll } = useNotifications()
// ============================================================

import { useEffect, useState, useCallback } from 'react'
import { notificationsApi } from '../api/client'

// Pre-seeded welcome notifications shown when the user first logs in
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'welcome',      // welcome | success | update | alert | info
    icon: '👋',
    message: 'Welcome back! 4 nearby places are open right now.',
    time: 'just now',
    read: false,
  },
  {
    id: 2,
    type: 'update',
    icon: '🟢',
    message: 'QuickCut Salon has a short wait — only 3 in queue!',
    time: '1 min ago',
    read: false,
  },
  {
    id: 3,
    type: 'alert',
    icon: '🔴',
    message: 'City Clinic is busy — estimated wait 35 min.',
    time: '3 min ago',
    read: true,
  },
]

const useNotifications = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)

  useEffect(() => {
    let active = true
    notificationsApi
      .list()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setNotifications(data)
        }
      })
      .catch(() => {
        /* keep the local welcome notifications if the API is unavailable */
      })
    return () => {
      active = false
    }
  }, [])

  // Add a new notification to the top of the list
  // notification: { type, icon, message }
  const addNotification = useCallback((notification) => {
    const newNotif = {
      id: Date.now(),                        // unique ID based on timestamp
      time: 'just now',
      read: false,
      ...notification,
    }
    setNotifications((prev) => [newNotif, ...prev])
    notificationsApi.create(notification).catch(() => {})
  }, [])

  // Mark every notification as read (clears the badge)
  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    notificationsApi.markAllRead().catch(() => {})
  }, [])

  // Remove all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Remove a single notification by ID
  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    notificationsApi.dismiss(id).catch(() => {})
  }, [])

  // Derived: count of unread notifications (shown as badge)
  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    unreadCount,
    addNotification,
    markAllRead,
    clearAll,
    dismiss,
  }
}

export default useNotifications
