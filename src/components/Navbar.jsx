// ============================================================
// Navbar Component — QueueAI
// Top navigation bar shown on all authenticated pages.
// Displays logo/back button, page title, notification bell,
// and user avatar.
// ============================================================

import React from 'react'
import { useNavigate } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Navbar = ({
  title,
  showBack = false,
  userEmail,
  // Notification props passed down from App.jsx
  notifications = [],
  unreadCount = 0,
  markAllRead,
  dismiss,
}) => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  // Sign out and return to the login screen
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        {/* Left: Back button or Logo */}
        <div className="navbar-left">
          {showBack ? (
            <button
              className="back-btn"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="navbar-brand" onClick={() => navigate('/browse')} style={{ cursor: 'pointer' }}>
              <div className="brand-icon" aria-hidden="true">⚡</div>
              <span className="brand-name">QueueAI</span>
            </div>
          )}
        </div>

        {/* Centre: Page title (shown when back button visible) */}
        {showBack && title && (
          <h1 className="navbar-title">{title}</h1>
        )}

        {/* Right: Notification bell + user avatar */}
        <div className="navbar-right">
          {/* Notification Bell — shown when user is logged in */}
          {userEmail && (
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              markAllRead={markAllRead}
              dismiss={dismiss}
            />
          )}

          {/* User avatar badge — click to log out */}
          {userEmail ? (
            <button
              className="user-badge"
              title={`${userEmail} — click to log out`}
              aria-label={`Logged in as ${userEmail}. Click to log out.`}
              onClick={handleLogout}
            >
              {userEmail.charAt(0).toUpperCase()}
            </button>
          ) : (
            <div className="user-badge" aria-label="User">U</div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
