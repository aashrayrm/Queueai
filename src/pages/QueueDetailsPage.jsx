// ============================================================
// QueueDetailsPage — QueueAI
// Detailed view of a place with live wait data from the backend.
// ============================================================

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { placesApi } from '../api/client'
import './QueueDetailsPage.css'

// Star rating display component (pure UI)
const Stars = ({ rating }) => {
  return (
    <div className="stars" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= Math.round(rating) ? 'filled' : 'empty'}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
      <span className="rating-value">{rating}</span>
    </div>
  )
}

const QueueDetailsPage = ({
  userEmail,
  notifications,
  unreadCount,
  addNotification,
  markAllRead,
  dismiss,
}) => {
  const { id } = useParams()
  const navigate = useNavigate()

  // Place data — fetched from the backend
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Live state — refreshed from the backend
  const [liveWaitMins, setLiveWaitMins] = useState(0)
  const [liveQueue, setLiveQueue] = useState(0)
  const [isFlashing, setIsFlashing] = useState(false)   // triggers flash animation
  const [lastRefresh, setLastRefresh] = useState(0)       // seconds since last update
  const notifSentRef = useRef(false)                      // prevent duplicate notifications

  // Fetch the place details from the backend on mount / id change
  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    placesApi
      .get(id)
      .then((data) => {
        if (!active) return
        setPlace(data)
        setLiveWaitMins(data.estimatedWaitMinutes || 0)
        setLiveQueue(data.currentQueue || 0)
      })
      .catch((err) => {
        if (!active) return
        setError(err.message || 'Could not load this place.')
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  // Live refresh: every 15 seconds, fetch the latest DB-backed estimate
  useEffect(() => {
    if (!place) return

    // Tick the "seconds since refresh" counter every second
    const secondsTicker = setInterval(() => {
      setLastRefresh((s) => s + 1)
    }, 1000)

    // Every 15 seconds, ask the backend for the latest calculation
    const updateInterval = setInterval(() => {
      placesApi
        .get(id)
        .then((data) => {
          const nextWait = data.estimatedWaitMinutes || 0
          setPlace(data)
          setLiveWaitMins((prev) => {
            if (nextWait !== prev) {
              setIsFlashing(true)
              setTimeout(() => setIsFlashing(false), 600)
            }
            return nextWait
          })
          setLiveQueue(data.currentQueue || 0)
          setLastRefresh(0)

          if (nextWait <= 5 && !notifSentRef.current && addNotification) {
            notifSentRef.current = true
            addNotification({
              type: 'alert',
              icon: '⏰',
              message: `Almost your turn at ${data.name}! ~${nextWait} min remaining.`,
            })
          }
        })
        .catch(() => {
          setLastRefresh(0)
        })
    }, 15000)

    return () => {
      clearInterval(secondsTicker)
      clearInterval(updateInterval)
    }
  }, [id, place?.id, addNotification])

  useEffect(() => {
    if (liveWaitMins <= 5 && liveWaitMins > 0 && !notifSentRef.current && addNotification && place) {
      notifSentRef.current = true
      addNotification({
        type: 'alert',
        icon: '⏰',
        message: `Almost your turn at ${place.name}! ~${liveWaitMins} min remaining.`,
      })
    }
  }, [liveWaitMins, place, addNotification])

  // Format seconds since last refresh for display
  const refreshLabel =
    lastRefresh < 5 ? 'just now' :
    lastRefresh < 60 ? `${lastRefresh}s ago` :
    `${Math.floor(lastRefresh / 60)}m ago`

  // Format minutes to readable string
  const formatWait = (mins) => {
    if (mins < 60) return `${mins} min`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }

  // While loading, show a spinner state
  if (loading) {
    return (
      <div className="page">
        <Navbar showBack title="Details" userEmail={userEmail}
          notifications={notifications} unreadCount={unreadCount}
          markAllRead={markAllRead} dismiss={dismiss} />
        <div className="not-found" role="status" aria-live="polite">
          <div className="spinner spinner-lg" aria-hidden="true" />
          <h2>Loading details…</h2>
          <p>Fetching the latest queue information.</p>
        </div>
      </div>
    )
  }

  // If loading failed or the place doesn't exist, show a friendly error
  if (error || !place) {
    return (
      <div className="page">
        <Navbar showBack title="Details" userEmail={userEmail}
          notifications={notifications} unreadCount={unreadCount}
          markAllRead={markAllRead} dismiss={dismiss} />
        <div className="not-found">
          <p className="not-found-icon" aria-hidden="true">😕</p>
          <h2>Place Not Found</h2>
          <p>{error || "We couldn't find that location."}</p>
          <button className="back-home-btn" onClick={() => navigate('/browse')}>
            Back to Browse
          </button>
        </div>
      </div>
    )
  }

  // Queue capacity as a percentage (using live queue value)
  const queuePercent = Math.min(
    Math.round((liveQueue / place.maxQueue) * 100),
    100
  )

  // Determine live status from current queue
  const getLiveStatus = () => {
    const pct = liveQueue / place.maxQueue
    if (pct <= 0.35) return { status: 'low', label: 'Short Wait' }
    if (pct <= 0.70) return { status: 'moderate', label: 'Moderate Wait' }
    return { status: 'busy', label: 'Busy Now' }
  }
  const liveStatus = getLiveStatus()

  return (
    <div className="page details-page">
      {/* Navbar with back button + notification bell */}
      <Navbar
        showBack
        title={place.name}
        userEmail={userEmail}
        notifications={notifications}
        unreadCount={unreadCount}
        markAllRead={markAllRead}
        dismiss={dismiss}
      />

      <div className="details-content fade-in">
        {/* Hero banner */}
        <div className="details-hero" style={{ background: place.bgGradient }}>
          <div className="hero-icon" role="img" aria-label={place.category}>
            {place.categoryIcon}
          </div>
          <div className="hero-info">
            <h1 className="hero-name">{place.name}</h1>
            <p className="hero-category">{place.category}</p>
            <Stars rating={place.rating} />
          </div>
          {/* Live status badge */}
          <span className={`status-badge status-${liveStatus.status} hero-status`}>
            <span className={`pulse-dot ${liveStatus.status}`} />
            {liveStatus.label}
          </span>
        </div>

        {/* Info row: address and hours */}
        <div className="info-cards-row">
          <div className="info-chip">
            <span className="info-chip-icon" aria-hidden="true">📍</span>
            <span>{place.address}</span>
          </div>
          <div className="info-chip">
            <span className="info-chip-icon" aria-hidden="true">🕐</span>
            <span>{place.hours}</span>
          </div>
        </div>

        {/* Description */}
        <div className="details-card">
          <p className="details-description">{place.description}</p>
        </div>

        {/* AI Wait Time — LIVE countdown */}
        <div className="ai-wait-card">
          <div className="ai-badge">
            <span aria-hidden="true">🤖</span>
            AI Prediction
            <span className="ai-confidence">{place.aiConfidence}% confidence</span>
          </div>

          {/* Live wait time number — flashes when updated */}
          <div className="ai-wait-display">
            <span
              className={`ai-wait-time ${isFlashing ? 'wait-flash' : ''}`}
              style={{ color: place.color }}
              aria-live="polite"
              aria-label={`Estimated wait: ${formatWait(liveWaitMins)}`}
            >
              {formatWait(liveWaitMins)}
            </span>
            <span className="ai-wait-label">estimated wait</span>

            {/* Live refresh indicator */}
            <div className="live-refresh-row">
              <span className="live-dot" aria-hidden="true" />
              <span className="live-refresh-text">
                Updated {refreshLabel}
              </span>
            </div>
          </div>

          {/* Confidence bar */}
          <div className="confidence-bar-track" aria-label={`AI confidence: ${place.aiConfidence}%`}>
            <div
              className="confidence-bar-fill"
              style={{
                width: `${place.aiConfidence}%`,
                backgroundColor: place.color,
              }}
            />
          </div>
        </div>

        {/* Queue stats grid */}
        <div className="stats-grid">
          {/* Current queue — live value */}
          <div className="stat-card">
            <div className="stat-icon" aria-hidden="true">👥</div>
            <div className="stat-value" aria-live="polite">{liveQueue}</div>
            <div className="stat-label">In Queue</div>
            <div className="stat-bar-track">
              <div
                className="stat-bar-fill"
                style={{
                  width: `${queuePercent}%`,
                  backgroundColor: place.color,
                }}
              />
            </div>
            <div className="stat-sub">of {place.maxQueue} max</div>
          </div>

          {/* Best time to visit */}
          <div className="stat-card stat-card-accent">
            <div className="stat-icon" aria-hidden="true">⭐</div>
            <div className="stat-label">Best Time to Visit</div>
            <div className="stat-best-time">{place.bestTimeToVisit}</div>
            <p className="stat-hint">AI recommends visiting at this time to avoid peak hours</p>
          </div>
        </div>

        {/* Reviews count */}
        <div className="reviews-row">
          <span className="reviews-icon" aria-hidden="true">💬</span>
          <span className="reviews-text">
            <strong>{place.reviews}</strong> customer reviews
          </span>
        </div>

        {/* Join Queue CTA */}
        <div className="cta-section">
          <button
            className="join-cta-btn"
            onClick={() => navigate(`/join/${place.id}`)}
            aria-label={`Join queue at ${place.name}`}
          >
            <span aria-hidden="true">➕</span>
            Join Queue Now
          </button>
          <p className="cta-hint">
            You'll receive a queue number and estimated notification time
          </p>
        </div>
      </div>
    </div>
  )
}

export default QueueDetailsPage
