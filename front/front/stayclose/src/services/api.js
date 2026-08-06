// ─── Configuration ──────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:8080/api'

// ─── Token & User helpers ───────────────────────────────────────────────────
export function saveToken(token) {
  localStorage.setItem('kc_token', token)
}

export function getToken() {
  return localStorage.getItem('kc_token')
}

export function removeToken() {
  localStorage.removeItem('kc_token')
  localStorage.removeItem('kc_user')
}

export function saveUser(user) {
  localStorage.setItem('kc_user', JSON.stringify(user))
}

export function getUser() {
  try {
    const data = localStorage.getItem('kc_user')
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return !!getToken() || !!getUser()
}

export function getStoredContacts() {
  try {
    const data = localStorage.getItem('kc_contacts')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveStoredContacts(contacts) {
  localStorage.setItem('kc_contacts', JSON.stringify(contacts))
}

// ─── HTTP client ─────────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    removeToken()
    window.location.href = '/login'
    throw new Error('Session expirée')
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || `Erreur ${res.status}`)
  }

  // 204 No Content
  if (res.status === 204) return null
  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function login(email, motDePasse) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, motDePasse }),
  })
  if (data?.token) saveToken(data.token)
  saveUser({
    name: data?.user?.nom || data?.nom || email.split('@')[0],
    email: email,
  })
  return data
}

export async function register(nom, email, motDePasse) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nom, email, motDePasse }),
  })
  if (data?.token) saveToken(data.token)
  saveUser({ name: nom, email: email })
  return data
}

// ─── Contacts ─────────────────────────────────────────────────────────────────
export async function getContacts() {
  return request('/contacts')
}

export async function getContact(id) {
  return request(`/contacts/${id}`)
}

export async function createContact(data) {
  return request('/contacts', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateContact(id, data) {
  return request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteContact(id) {
  return request(`/contacts/${id}`, { method: 'DELETE' })
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function getDashboard() {
  return request('/dashboard')
}

// ─── Notifications ────────────────────────────────────────────────────────────
export async function getNotifications() {
  return request('/notifications')
}

export async function markNotificationRead(id) {
  return request(`/notifications/${id}/read`, { method: 'PATCH' })
}
