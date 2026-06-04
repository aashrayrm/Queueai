// ============================================================
// App.jsx — QueueAI
// Root component. Sets up React Router, reads auth state from
// AuthContext (persisted in localStorage), and hosts the global
// notification system.
// ============================================================

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Page imports
import LoginPage from './pages/LoginPage'
import BrowsePage from './pages/BrowsePage'
import QueueDetailsPage from './pages/QueueDetailsPage'
import JoinQueuePage from './pages/JoinQueuePage'
import ConfirmationPage from './pages/ConfirmationPage'

// Notification hook — single source of truth for all alerts
import useNotifications from './hooks/useNotifications'

// Auth context — persisted login state
import { useAuth } from './context/AuthContext'

// ProtectedRoute — redirects to login if user is not logged in
const ProtectedRoute = ({ userEmail, children }) => {
  if (!userEmail) {
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  // Logged-in user email comes from the persisted auth context
  const { userEmail } = useAuth()

  // Global notification state — shared across all pages and the Navbar
  const { notifications, unreadCount, addNotification, markAllRead, dismiss } =
    useNotifications()

  // Bundle notification props into one object for easy prop-passing
  const notifProps = { notifications, unreadCount, addNotification, markAllRead, dismiss }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login — public route (no notifications needed) */}
        <Route
          path="/"
          element={
            userEmail
              ? <Navigate to="/browse" replace />
              : <LoginPage />
          }
        />

        {/* Browse — protected; receives live queue + notifications */}
        <Route
          path="/browse"
          element={
            <ProtectedRoute userEmail={userEmail}>
              <BrowsePage userEmail={userEmail} {...notifProps} />
            </ProtectedRoute>
          }
        />

        {/* Queue Details — protected; receives notifications for live updates */}
        <Route
          path="/details/:id"
          element={
            <ProtectedRoute userEmail={userEmail}>
              <QueueDetailsPage userEmail={userEmail} {...notifProps} />
            </ProtectedRoute>
          }
        />

        {/* Join Queue — protected */}
        <Route
          path="/join/:id"
          element={
            <ProtectedRoute userEmail={userEmail}>
              <JoinQueuePage userEmail={userEmail} {...notifProps} />
            </ProtectedRoute>
          }
        />

        {/* Confirmation — fires a notification on mount */}
        <Route
          path="/confirmation"
          element={
            <ProtectedRoute userEmail={userEmail}>
              <ConfirmationPage userEmail={userEmail} {...notifProps} />
            </ProtectedRoute>
          }
        />

        {/* Catch-all: redirect unknown URLs to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
