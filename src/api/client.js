// ============================================================
// api/client.js — QueueAI Frontend
// Central API wrapper. The frontend talks ONLY to the FastAPI
// backend (never directly to Supabase).
//
// Base URL comes from VITE_API_BASE_URL:
//   • Local dev:  http://localhost:8000
//   • Production: "" (same Vercel domain, routes to /api/*)
// ============================================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

// Core request helper — returns parsed `data` or throws an Error
async function request(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Cannot reach the server. Please check your connection.')
  }

  let payload = null
  try {
    payload = await res.json()
  } catch {
    payload = null
  }

  if (!res.ok || (payload && payload.success === false)) {
    const message =
      (payload && payload.error) || 'Something went wrong. Please try again.'
    throw new Error(message)
  }

  return payload ? payload.data : null
}

// ---------- Auth ----------
export const authApi = {
  register: (email, password) =>
    request('/auth/register', { method: 'POST', body: { email, password } }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
}

// ---------- Places ----------
export const placesApi = {
  list: () => request('/places'),
  get: (id) => request(`/places/${id}`),
}

// ---------- Queue ----------
export const queueApi = {
  join: ({ placeId, customerName, numberOfPersons }) =>
    request('/queue/join', {
      method: 'POST',
      body: {
        place_id: placeId,
        customer_name: customerName,
        number_of_persons: numberOfPersons,
      },
    }),
  get: (entryId) => request(`/queue/${entryId}`),
}

// ---------- Notifications ----------
export const notificationsApi = {
  list: () => request('/notifications'),
  create: ({ type, icon, message }) =>
    request('/notifications', { method: 'POST', body: { type, icon, message } }),
  markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
  dismiss: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),
}

// ---------- System ----------
export const systemApi = {
  health: () => request('/health'),
}
