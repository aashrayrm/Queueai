// ============================================================
// JoinQueuePage — QueueAI
// Form for users to enter their name and party size to join
// the queue at a selected place. Calculates live wait estimate.
// ============================================================

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { placesApi, queueApi } from '../api/client'
import './JoinQueuePage.css'

// Party size options
const PARTY_SIZES = [1, 2, 3, 4, 5, 6]

const JoinQueuePage = ({ userEmail, notifications, unreadCount, markAllRead, dismiss }) => {
  const { id } = useParams()
  const navigate = useNavigate()

  // Place data — fetched from the backend
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [name, setName] = useState('')
  const [partySize, setPartySize] = useState(1)
  const [nameError, setNameError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch the place on mount
  useEffect(() => {
    let active = true
    setLoading(true)
    placesApi
      .get(id)
      .then((data) => active && setPlace(data))
      .catch(() => active && setPlace(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  // Dynamically calculate wait based on party size
  // Each extra person adds ~2 min to base estimate
  const estimatedWait =
    place ? place.estimatedWaitMinutes + (partySize - 1) * 2 : 0

  // Format minutes nicely
  const formatWait = (mins) => {
    if (mins < 60) return `${mins} min`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }

  // While loading
  if (loading) {
    return (
      <div className="page">
        <Navbar showBack title="Join Queue" userEmail={userEmail}
          notifications={notifications} unreadCount={unreadCount}
          markAllRead={markAllRead} dismiss={dismiss} />
        <div className="not-found" role="status" aria-live="polite">
          <div className="spinner spinner-lg" aria-hidden="true" />
          <p>Loading…</p>
        </div>
      </div>
    )
  }

  // Handle not-found
  if (!place) {
    return (
      <div className="page">
        <Navbar showBack title="Join Queue" userEmail={userEmail}
          notifications={notifications} unreadCount={unreadCount}
          markAllRead={markAllRead} dismiss={dismiss} />
        <div className="not-found">
          <p>Place not found.</p>
          <button onClick={() => navigate('/browse')}>Back to Browse</button>
        </div>
      </div>
    )
  }

  const validate = () => {
    if (!name.trim()) {
      setNameError('Please enter your name.')
      return false
    }
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters.')
      return false
    }
    setNameError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitError('')
    setSubmitting(true)
    try {
      // Persist the queue entry via the backend (writes to Supabase)
      const entry = await queueApi.join({
        placeId: place.id,
        customerName: name.trim(),
        numberOfPersons: partySize,
      })

      navigate('/confirmation', {
        state: {
          entryId: entry.id,
          placeName: entry.placeName ?? place.name,
          placeIcon: entry.placeIcon ?? place.categoryIcon,
          customerName: entry.customerName,
          partySize: entry.partySize,
          estimatedWait: entry.estimatedWait ?? formatWait(estimatedWait),
          queueNumber: entry.queueNumber,
        },
      })
    } catch (err) {
      setSubmitError(err.message || 'Could not join the queue. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="page join-page">
      {/* Navbar with back button + notification bell */}
      <Navbar
        showBack
        title="Join Queue"
        userEmail={userEmail}
        notifications={notifications}
        unreadCount={unreadCount}
        markAllRead={markAllRead}
        dismiss={dismiss}
      />

      <div className="join-content fade-in">
        {/* Place summary at top */}
        <div className="join-place-summary" style={{ background: place.bgGradient }}>
          <span className="join-place-icon" role="img" aria-label={place.category}>
            {place.categoryIcon}
          </span>
          <div>
            <h2 className="join-place-name">{place.name}</h2>
            <p className="join-place-cat">{place.category}</p>
          </div>
          <span className={`status-badge status-${place.status}`} style={{ marginLeft: 'auto' }}>
            <span className={`pulse-dot ${place.status}`} />
            {place.statusLabel}
          </span>
        </div>

        {/* Live estimated wait display */}
        <div className="wait-preview-card">
          <div className="wait-preview-label">
            <span aria-hidden="true">⏱️</span>
            Your estimated wait
          </div>
          <div className="wait-preview-value" style={{ color: place.color }}>
            {formatWait(estimatedWait)}
          </div>
          <p className="wait-preview-note">
            Updates as you change your party size
          </p>
        </div>

        {/* Join Queue Form */}
        <form onSubmit={handleSubmit} noValidate className="join-form">
          <h3 className="join-form-title">Your Details</h3>

          {/* Name field */}
          <div className="form-group">
            <label htmlFor="customer-name" className="form-label">
              Full Name <span className="required" aria-hidden="true">*</span>
            </label>
            <div className="input-wrap">
              <span className="input-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="customer-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (nameError) setNameError('')
                }}
                placeholder="Enter your full name"
                aria-required="true"
                aria-describedby={nameError ? 'name-error' : undefined}
                className={`form-input ${nameError ? 'input-error' : ''}`}
                autoComplete="name"
                maxLength={50}
              />
            </div>
            {nameError && (
              <p id="name-error" className="field-error" role="alert">
                {nameError}
              </p>
            )}
          </div>

          {/* Party size selector */}
          <div className="form-group">
            <label className="form-label">
              Number of People <span className="required" aria-hidden="true">*</span>
            </label>
            <div className="party-grid" role="group" aria-label="Select party size">
              {PARTY_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`party-btn ${partySize === size ? 'active' : ''}`}
                  onClick={() => setPartySize(size)}
                  aria-pressed={partySize === size}
                  aria-label={`${size} ${size === 1 ? 'person' : 'people'}`}
                >
                  <span className="party-btn-icon" aria-hidden="true">
                    {size === 1 ? '👤' : '👥'}
                  </span>
                  <span className="party-btn-num">{size}</span>
                  <span className="party-btn-label">{size === 1 ? 'person' : 'people'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary box before confirm */}
          <div className="join-summary-box">
            <div className="summary-row">
              <span>📍 Location</span>
              <span>{place.name}</span>
            </div>
            <div className="summary-row">
              <span>👤 Name</span>
              <span>{name || '—'}</span>
            </div>
            <div className="summary-row">
              <span>👥 Party size</span>
              <span>{partySize} {partySize === 1 ? 'person' : 'people'}</span>
            </div>
            <div className="summary-row summary-row-highlight">
              <span>⏱️ Est. wait</span>
              <span style={{ color: place.color, fontWeight: 700 }}>
                {formatWait(estimatedWait)}
              </span>
            </div>
          </div>

          {/* Submit error */}
          {submitError && (
            <p className="field-error" role="alert" style={{ marginBottom: '0.75rem' }}>
              ⚠️ {submitError}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className={`confirm-btn ${submitting ? 'loading' : ''}`}
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Joining Queue…
              </>
            ) : (
              <>
                <span aria-hidden="true">✅</span>
                Confirm &amp; Join Queue
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default JoinQueuePage
