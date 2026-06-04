// ============================================================
// BrowsePage — QueueAI
// Shows all nearby places as cards with live backend queue updates.
// ============================================================

import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import PlaceCard from '../components/PlaceCard'
import useLiveQueue from '../hooks/useLiveQueue'
import './BrowsePage.css'

// Category filter options
const FILTERS = ['All', 'Café', 'Salon', 'Clinic', 'Restaurant']

// Format a Date object into "X sec/min ago" string
const timeAgo = (date) => {
  const secs = Math.round((new Date() - date) / 1000)
  if (secs < 5)  return 'just now'
  if (secs < 60) return `${secs}s ago`
  return `${Math.floor(secs / 60)}m ago`
}

const BrowsePage = ({
  userEmail,
  // Notification props from App.jsx
  notifications,
  unreadCount,
  addNotification,
  markAllRead,
  dismiss,
}) => {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  // Live queue data — fetched from the backend, then kept "live"
  const { livePlaces, lastUpdated, isUpdating, loading, error, reload } =
    useLiveQueue(addNotification)

  // Filter places by search text and selected category
  const filtered = livePlaces.filter((place) => {
    const matchesSearch =
      place.name.toLowerCase().includes(search.toLowerCase()) ||
      place.category.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      activeFilter === 'All' || place.category === activeFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="page browse-page">
      {/* Top navigation bar — receives notification bell props */}
      <Navbar
        userEmail={userEmail}
        notifications={notifications}
        unreadCount={unreadCount}
        markAllRead={markAllRead}
        dismiss={dismiss}
      />

      <div className="browse-content">
        {/* Page heading */}
        <div className="browse-hero">
          <div>
            <h1 className="browse-title">Nearby Places</h1>
            <p className="browse-subtitle">
              AI-powered wait times, updated in real time
            </p>
          </div>
          {/* Live indicator with update status */}
          <div className="live-chip-wrap">
            <div className="live-chip" aria-label="Live updates active">
              <span className={`pulse-dot ${isUpdating ? 'busy' : 'moderate'}`} />
              {isUpdating ? 'Updating…' : 'Live'}
            </div>
            {/* Last updated timestamp */}
            <span className="last-updated" aria-live="polite">
              {timeAgo(lastUpdated)}
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div className="search-bar-wrap">
          <span className="search-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="search"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search places or categories…"
            aria-label="Search places"
          />
          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category filter pills */}
        <div className="filter-row" role="group" aria-label="Filter by category">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="empty-state" role="status" aria-live="polite">
            <div className="spinner spinner-lg" aria-hidden="true" />
            <h3>Loading nearby places…</h3>
            <p>Fetching live queue data from the server</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="empty-state" role="alert">
            <div className="empty-icon" aria-hidden="true">⚠️</div>
            <h3>Couldn't load places</h3>
            <p>{error}</p>
            <button className="reset-btn" onClick={reload}>
              Try again
            </button>
          </div>
        )}

        {/* Result count */}
        {!loading && !error && (
          <p className="result-count" aria-live="polite">
            {filtered.length === 0
              ? 'No places found'
              : `${filtered.length} place${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        )}

        {/* Place Cards Grid — cards receive live data */}
        {!loading && !error && (
          filtered.length > 0 ? (
            <div className="places-grid" aria-label="Places list">
              {filtered.map((place, index) => (
                <div
                  key={place.id}
                  style={{ animationDelay: `${index * 0.07}s` }}
                  className={isUpdating ? 'card-updating' : ''}
                >
                  <PlaceCard place={place} />
                </div>
              ))}
            </div>
          ) : (
            // Empty state
            <div className="empty-state" role="status">
              <div className="empty-icon" aria-hidden="true">🔍</div>
              <h3>No matches found</h3>
              <p>Try a different search term or category</p>
              <button
                className="reset-btn"
                onClick={() => { setSearch(''); setActiveFilter('All') }}
              >
                Reset filters
              </button>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default BrowsePage
