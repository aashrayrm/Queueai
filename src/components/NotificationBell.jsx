// ============================================================
// NotificationBell — QueueAI
// Notification bell icon with unread badge and dropdown panel.
// Appears in the Navbar on all authenticated pages.
// Props:
//   notifications  — array of notification objects
//   unreadCount    — number of unread items (badge)
//   markAllRead    — function to mark all as read
//   dismiss        — function to remove a single notification by id
// ============================================================

import React, { useState, useEffect, useRef } from 'react'
import './NotificationBell.css'

// Icon map for each notification type
const TYPE_COLORS = {
  welcome: '#4f46e5',
  success: '#10b981',
  update: '#10b981',
  alert: '#ef4444',
  info: '#f59e0b',
}

const NotificationBell = ({ notifications = [], unreadCount = 0, markAllRead, dismiss }) => {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef(null)
  const bellRef = useRef(null)

  // Close the dropdown when user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // When dropdown opens, mark all as read after a short delay
  const handleBellClick = () => {
    setIsOpen((prev) => !prev)
    if (!isOpen && unreadCount > 0) {
      // Small delay so the badge is still visible momentarily
      setTimeout(() => markAllRead?.(), 1200)
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <div className="notif-wrapper">
      {/* Bell Button */}
      <button
        ref={bellRef}
        className={`notif-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={handleBellClick}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Bell SVG icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={unreadCount > 0 ? 'bell-ring' : ''}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread badge — only shown when there are unread notifications */}
        {unreadCount > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="notif-panel"
          role="dialog"
          aria-label="Notifications"
        >
          {/* Panel header */}
          <div className="notif-panel-header">
            <h3 className="notif-panel-title">Notifications</h3>
            <div className="notif-panel-actions">
              {notifications.length > 0 && (
                <button
                  className="notif-clear-btn"
                  onClick={() => {
                    markAllRead?.()
                    setIsOpen(false)
                  }}
                  aria-label="Mark all as read"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div className="notif-list" role="list">
            {notifications.length === 0 ? (
              /* Empty state */
              <div className="notif-empty">
                <span className="notif-empty-icon" aria-hidden="true">🔕</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 8).map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-item ${notif.read ? 'read' : 'unread'}`}
                  role="listitem"
                >
                  {/* Notification icon */}
                  <span className="notif-item-icon" aria-hidden="true">
                    {notif.icon}
                  </span>

                  {/* Message + time */}
                  <div className="notif-item-body">
                    <p className="notif-item-msg">{notif.message}</p>
                    <span className="notif-item-time">{notif.time}</span>
                  </div>

                  {/* Unread dot */}
                  {!notif.read && (
                    <span className="notif-unread-dot" aria-hidden="true" />
                  )}

                  {/* Dismiss button */}
                  <button
                    className="notif-dismiss-btn"
                    onClick={() => dismiss?.(notif.id)}
                    aria-label="Dismiss notification"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 8 && (
            <div className="notif-panel-footer">
              +{notifications.length - 8} more notifications
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
