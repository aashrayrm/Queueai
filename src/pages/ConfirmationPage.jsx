// ============================================================
// ConfirmationPage — QueueAI
// Shown after a user successfully joins a queue.
// Fires a success notification on mount. Shows queue number,
// wait time, tips, and return to dashboard button.
// ============================================================

import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './ConfirmationPage.css'

// Countdown timer hook — counts down from a given number of seconds
const useCountdown = (initialSeconds) => {
  const [seconds, setSeconds] = useState(initialSeconds)
  useEffect(() => {
    if (seconds <= 0) return
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds])
  return seconds
}

const ConfirmationPage = ({
  userEmail,
  notifications,
  unreadCount,
  addNotification,
  markAllRead,
  dismiss,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const notifFiredRef = useRef(false)  // ensure we only fire once

  // Read data passed via React Router state from JoinQueuePage
  const state = location.state || {}
  const {
    placeName = 'Selected Place',
    placeIcon = '📍',
    customerName = 'Customer',
    partySize = 1,
    estimatedWait = '15 min',
    queueNumber = 'A-00',
  } = state

  // Auto-redirect countdown (30 seconds)
  const countdown = useCountdown(30)

  // Auto-navigate back to browse after countdown
  useEffect(() => {
    if (countdown === 0) {
      navigate('/browse')
    }
  }, [countdown, navigate])

  // Fire notifications when this page mounts (queue just joined)
  useEffect(() => {
    if (notifFiredRef.current || !addNotification) return
    notifFiredRef.current = true

    // Immediate success notification
    addNotification({
      type: 'success',
      icon: '✅',
      message: `You joined the queue at ${placeName}! Your number is ${queueNumber}.`,
    })

    // Follow-up notification after 3 seconds with wait time info
    const timer = setTimeout(() => {
      addNotification({
        type: 'info',
        icon: '⏱️',
        message: `Your estimated wait at ${placeName} is ${estimatedWait}. We'll notify you when it's almost your turn.`,
      })
    }, 3000)

    return () => clearTimeout(timer)
  }, [addNotification, placeName, queueNumber, estimatedWait])

  // Extract minutes from estimatedWait string for notification time
  const notifyTime = (() => {
    const match = estimatedWait.match(/\d+/)
    if (!match) return '—'
    const mins = parseInt(match[0])
    const now = new Date()
    now.setMinutes(now.getMinutes() + mins - 3)
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })()

  return (
    <div className="page confirmation-page">
      {/* Navbar with notification bell */}
      <Navbar
        showBack
        title="Queue Confirmed"
        userEmail={userEmail}
        notifications={notifications}
        unreadCount={unreadCount}
        markAllRead={markAllRead}
        dismiss={dismiss}
      />

      <div className="confirmation-content fade-in">
        {/* Success animation area */}
        <div className="success-area">
          <div className="success-ring" aria-hidden="true">
            <div className="success-icon-wrap">
              <span className="success-check" aria-hidden="true">✓</span>
            </div>
          </div>
          <h1 className="success-title">You're in the Queue!</h1>
          <p className="success-subtitle">
            Successfully joined the queue at <strong>{placeName}</strong>
          </p>
        </div>

        {/* Queue Number — big highlight */}
        <div className="queue-number-card">
          <div className="queue-number-label">Your Queue Number</div>
          <div className="queue-number-value">{queueNumber}</div>
          <p className="queue-number-hint">Show this number when you arrive</p>
        </div>

        {/* Details grid */}
        <div className="confirm-details-grid">
          {/* Customer */}
          <div className="confirm-detail-card">
            <div className="confirm-detail-icon" aria-hidden="true">👤</div>
            <div className="confirm-detail-label">Name</div>
            <div className="confirm-detail-value">{customerName}</div>
          </div>

          {/* Party size */}
          <div className="confirm-detail-card">
            <div className="confirm-detail-icon" aria-hidden="true">👥</div>
            <div className="confirm-detail-label">Party Size</div>
            <div className="confirm-detail-value">
              {partySize} {partySize === 1 ? 'person' : 'people'}
            </div>
          </div>

          {/* Wait time */}
          <div className="confirm-detail-card">
            <div className="confirm-detail-icon" aria-hidden="true">⏱️</div>
            <div className="confirm-detail-label">Est. Wait</div>
            <div className="confirm-detail-value">{estimatedWait}</div>
          </div>

          {/* Location */}
          <div className="confirm-detail-card">
            <div className="confirm-detail-icon" aria-hidden="true">{placeIcon}</div>
            <div className="confirm-detail-label">Location</div>
            <div className="confirm-detail-value">{placeName}</div>
          </div>
        </div>

        {/* Notification notice */}
        <div className="notify-card">
          <div className="notify-icon" aria-hidden="true">🔔</div>
          <div className="notify-body">
            <p className="notify-title">We'll notify you at approximately</p>
            <p className="notify-time">{notifyTime}</p>
            <p className="notify-hint">
              Please arrive at <strong>{placeName}</strong> a few minutes before your slot
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="tips-card">
          <h3 className="tips-title">📋 Before you go</h3>
          <ul className="tips-list">
            <li>Arrive at least 3 minutes before your estimated time</li>
            <li>Show your queue number <strong>{queueNumber}</strong> at the counter</li>
            <li>Contact the venue if you need to cancel</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="confirm-actions">
          <button
            className="return-btn"
            onClick={() => navigate('/browse')}
            aria-label="Return to dashboard"
          >
            Return to Dashboard
          </button>
          <p className="auto-return-text" aria-live="polite">
            Auto-returning in <strong>{countdown}s</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationPage
