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
  return !!getToken() && !!getUser()
}

export function getRegisteredAccounts() {
  try {
    const data = localStorage.getItem('kc_registered_accounts')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveRegisteredAccount(account) {
  const accounts = getRegisteredAccounts()
  const existsIndex = accounts.findIndex(a => a.email.toLowerCase() === account.email.toLowerCase())
  if (existsIndex >= 0) {
    accounts[existsIndex] = account
  } else {
    accounts.push(account)
  }
  localStorage.setItem('kc_registered_accounts', JSON.stringify(accounts))
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
  try {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, motDePasse }),
    })
    if (data?.token) saveToken(data.token)
    const userObj = {
      name: data?.user?.nom || data?.nom || email.split('@')[0],
      email: email,
    }
    saveUser(userObj)
    saveRegisteredAccount({ name: userObj.name, email, password: motDePasse })
    return data
  } catch (err) {
    // Si le serveur backend a retourné une vraie réponse d'erreur HTTP (ex: 400, 401, 404)
    if (!err.message.includes('fetch') && !err.message.includes('récupération') && !err.message.includes('Failed to fetch')) {
      throw new Error(err.message || 'Identifiants incorrects ou compte inexistant.')
    }

    // Si le backend est hors ligne / non démarré: vérification dans les comptes enregistrés localement
    const localAccounts = getRegisteredAccounts()
    const found = localAccounts.find(a => a.email.toLowerCase() === email.toLowerCase())

    if (!found) {
      throw new Error('Aucun compte trouvé avec cet e-mail. Veuillez vous inscrire d\'abord.')
    }
    if (found.password !== motDePasse) {
      throw new Error('Mot de passe incorrect.')
    }

    // Compte local valide trouvé
    saveToken('demo_token_' + Date.now())
    saveUser({ name: found.name || email.split('@')[0], email: found.email })
    return { success: true }
  }
}

export async function register(nom, email, motDePasse) {
  const userObj = { name: nom, email: email }
  saveRegisteredAccount({ name: nom, email, password: motDePasse })

  try {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nom, email, motDePasse }),
    })
    if (data?.token) saveToken(data.token)
    saveUser(userObj)
    return data
  } catch (err) {
    // Si le serveur backend a retourné une erreur HTTP réelle (ex: email déjà pris)
    if (!err.message.includes('fetch') && !err.message.includes('récupération') && !err.message.includes('Failed to fetch')) {
      throw new Error(err.message || 'Erreur lors de la création du compte.')
    }

    // Inscription en mode démo si backend hors ligne
    saveToken('demo_token_' + Date.now())
    saveUser(userObj)
    return { success: true }
  }
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
