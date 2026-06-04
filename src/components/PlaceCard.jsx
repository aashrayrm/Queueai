// ============================================================
// PlaceCard Component — QueueAI
// Displays a summary card for a place in the Browse screen.
// Shows name, category, wait time, status, and a View Details button.
// ============================================================

import React from 'react'
import { useNavigate } from 'react-router-dom'
import './PlaceCard.css'

const PlaceCard = ({ place }) => {
  const navigate = useNavigate()

  // Calculate queue fill percentage for the progress bar
  const queuePercent = Math.min(
    Math.round((place.currentQueue / place.maxQueue) * 100),
    100
  )

  return (
    <article
      className="place-card fade-in"
      aria-label={`${place.name} - ${place.statusLabel}`}
    >
      {/* Card header with gradient icon area */}
      <div className="card-header" style={{ background: place.bgGradient }}>
        <span className="card-icon" role="img" aria-label={place.category}>
          {place.categoryIcon}
        </span>
        {/* Live status badge */}
        <span className={`status-badge status-${place.status}`}>
          <span className={`pulse-dot ${place.status}`} />
          {place.statusLabel}
        </span>
      </div>

      {/* Card body */}
      <div className="card-body">
        <div className="card-info">
          <h2 className="card-name">{place.name}</h2>
          <p className="card-category">{place.category}</p>
        </div>

        {/* Wait time highlight */}
        <div className="card-wait">
          <span className="wait-label">Est. Wait</span>
          <span className="wait-value" style={{ color: place.color }}>
            {place.estimatedWait}
          </span>
        </div>

        {/* Queue fill progress bar */}
        <div className="queue-bar-wrap" aria-label={`Queue: ${place.currentQueue} of ${place.maxQueue} people`}>
          <div className="queue-bar-track">
            <div
              className="queue-bar-fill"
              style={{
                width: `${queuePercent}%`,
                backgroundColor: place.color,
              }}
            />
          </div>
          <span className="queue-count">
            {place.currentQueue}/{place.maxQueue} in queue
          </span>
        </div>

        {/* Action button */}
        <button
          className="view-btn"
          onClick={() => navigate(`/details/${place.id}`)}
          aria-label={`View details for ${place.name}`}
        >
          View Details
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </article>
  )
}

export default PlaceCard
