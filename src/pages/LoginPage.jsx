// ============================================================
// LoginPage — QueueAI
// First screen users see. Validates credentials and navigates
// to the Browse screen. No real auth — this is an MVP demo.
// ============================================================

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Form state
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isRegister = mode === 'register'

  // Simple validation
  const validate = () => {
    if (!email.trim()) return 'Please enter your email address.'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address.'
    if (!password.trim()) return 'Please enter your password.'
    if (password.length < 6) return 'Password must be at least 6 characters.'
    return null
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const errorMsg = validate()
    if (errorMsg) {
      setError(errorMsg)
      return
    }

    setError('')
    setLoading(true)
    try {
      const session = isRegister
        ? await authApi.register(email.trim(), password)
        : await authApi.login(email.trim(), password)

      // Persist session and enter the app
      login(session ?? { user: { email: email.trim() }, token: null })
      navigate('/browse')
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Toggle between sign in and create account
  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setError('')
  }

  return (
    <div className="login-page">
      {/* Decorative background blobs */}
      <div className="login-bg">
        <div className="blob blob-1" aria-hidden="true" />
        <div className="blob blob-2" aria-hidden="true" />
      </div>

      <div className="login-container fade-in">
        {/* Header / Branding */}
        <header className="login-header">
          <div className="login-logo" aria-hidden="true">⚡</div>
          <h1 className="login-brand">QueueAI</h1>
          <p className="login-tagline">Skip the wait. Join smarter.</p>
        </header>

        {/* Welcome card */}
        <div className="login-card">
          <div className="login-card-top">
            <h2 className="login-title">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="login-subtitle">
              {isRegister
                ? 'Sign up to start skipping the queue'
                : 'Sign in to manage your queues'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="login-error" role="alert">
              <span aria-hidden="true">⚠️</span> {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} noValidate className="login-form">
            {/* Email field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email address</label>
              <div className="input-wrap">
                <span className="input-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-required="true"
                  className="form-input"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-required="true"
                  className="form-input"
                />
                {/* Toggle password visibility */}
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className={`login-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  {isRegister ? 'Creating account…' : 'Signing in…'}
                </>
              ) : (
                isRegister ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Switch between sign in and create account */}
          <div className="demo-section">
            <p className="demo-text">
              {isRegister ? 'Already have an account?' : 'New here?'}{' '}
              <button type="button" className="demo-link" onClick={toggleMode}>
                {isRegister ? 'Sign in' : 'Create an account'}
              </button>
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="login-features" aria-label="App features">
          <div className="feature-item">
            <span className="feature-icon" aria-hidden="true">🤖</span>
            <span>AI Wait Predictions</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon" aria-hidden="true">📍</span>
            <span>Remote Queue Join</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon" aria-hidden="true">⏱️</span>
            <span>Live Updates</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
