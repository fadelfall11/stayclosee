import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import '../components/AppLayout.css'
import { getUser, saveUser, saveRegisteredAccount, removeToken, formatNameFromEmail } from '../services/api'
import { useTheme } from '../contexts/ThemeContext'

function Toggle({ checked, onChange, id }) {
  return (
    <label className="toggle-switch" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} />
      <span className="toggle-slider" />
    </label>
  )
}

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

export default function SettingsPage() {
  const navigate = useNavigate()
  const { dark, toggle: toggleTheme } = useTheme()

  const [currentUser, setCurrentUser] = useState(() => getUser())
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')

  const [notifBirthdays, setNotifBirthdays] = useState(true)
  const [notifReminders, setNotifReminders] = useState(true)
  const [notifWeekly,    setNotifWeekly]    = useState(false)

  useEffect(() => {
    const u = getUser()
    if (u) {
      setCurrentUser(u)
      setEditName(u.name || '')
      setEditEmail(u.email || '')
    }
  }, [])

  const userName = currentUser?.name || 'Mon Compte'
  const userEmail = currentUser?.email || 'utilisateur@keepintouch.com'
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'US'

  const handleLogout = () => {
    removeToken()
    navigate('/login')
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    const updated = {
      name: editName.trim() || formatNameFromEmail(editEmail) || userName,
      email: editEmail.trim() || userEmail,
    }
    saveUser(updated)
    saveRegisteredAccount(updated)
    setCurrentUser(updated)
    setIsEditing(false)
  }

  return (
    <div className="app-page">
      <div className="app-page-inner">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-header-title">Réglages</h1>
        </div>

        <div className="page-content">
          {/* Profile card */}
          <div className="card" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="avatar" style={{ width: 56, height: 56, background: 'var(--primary-soft-bg)', fontSize: 20 }}>
                <span className="avatar-initials">{initials}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</p>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  padding: '6px 12px', borderRadius: 10, border: '1px solid var(--border)',
                  background: 'var(--input-bg)', color: 'var(--primary)', fontWeight: 600,
                  fontSize: 12, cursor: 'pointer', flexShrink: 0
                }}
              >
                {isEditing ? 'Fermer' : '✏️ Modifier'}
              </button>
            </div>

            {/* Formulaire de modification de profil */}
            {isEditing && (
              <form onSubmit={handleSaveProfile} style={{
                display: 'flex', flexDirection: 'column', gap: 10,
                marginTop: 6, paddingTop: 14, borderTop: '1px solid var(--border)'
              }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Nom complet</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Ex: Fadel Fall"
                    style={{
                      width: '100%', padding: '9px 12px', marginTop: 4, borderRadius: 10,
                      border: '1px solid var(--border)', outline: 'none', fontSize: 14,
                      background: 'var(--input-bg)', color: 'var(--text)'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Adresse e-mail</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    placeholder="Ex: fadel@gmail.com"
                    style={{
                      width: '100%', padding: '9px 12px', marginTop: 4, borderRadius: 10,
                      border: '1px solid var(--border)', outline: 'none', fontSize: 14,
                      background: 'var(--input-bg)', color: 'var(--text)'
                    }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '10px', borderRadius: 10, border: 'none',
                    background: 'var(--primary)', color: '#fff', fontWeight: 600,
                    fontSize: 13, cursor: 'pointer', marginTop: 4
                  }}
                >
                  Enregistrer les modifications
                </button>
              </form>
            )}
          </div>

          {/* Notifications section */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Notifications</h2>
            </div>
            <div className="card">
              <div className="setting-row">
                <span className="setting-label">Anniversaires</span>
                <Toggle id="toggle-birthdays" checked={notifBirthdays} onChange={e => setNotifBirthdays(e.target.checked)} />
              </div>
              <div className="setting-row">
                <span className="setting-label">Rappels de contact</span>
                <Toggle id="toggle-reminders" checked={notifReminders} onChange={e => setNotifReminders(e.target.checked)} />
              </div>
              <div className="setting-row">
                <span className="setting-label">Résumé hebdomadaire</span>
                <Toggle id="toggle-weekly" checked={notifWeekly} onChange={e => setNotifWeekly(e.target.checked)} />
              </div>
            </div>
          </section>

          {/* Appearance section */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Apparence</h2>
            </div>
            <div className="card">
              <div className="setting-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{dark ? '🌙' : '☀️'}</span>
                  <div>
                    <span className="setting-label">Thème sombre</span>
                    <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-secondary)' }}>
                      {dark ? 'Mode nuit activé' : 'Mode clair activé'}
                    </p>
                  </div>
                </div>
                <Toggle id="toggle-dark-mode" checked={dark} onChange={toggleTheme} />
              </div>
            </div>
          </section>

          {/* Preferences section */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Préférences</h2>
            </div>
            <div className="card">
              {[
                { label: 'Langue',              value: 'Français',   id: 'pref-language' },
                { label: 'Fréquence par défaut', value: '1 semaine', id: 'pref-frequency' },
              ].map(row => (
                <div key={row.id} id={row.id} className="setting-row" style={{ cursor: 'pointer' }}>
                  <span className="setting-label">{row.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="setting-value">{row.value}</span>
                    <span style={{ color: 'var(--placeholder)' }}><ChevronRight /></span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Account section */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Compte</h2>
            </div>
            <div className="card">
              <div id="account-privacy" className="setting-row" style={{ cursor: 'pointer' }}>
                <span className="setting-label">Confidentialité</span>
                <span style={{ color: 'var(--placeholder)' }}><ChevronRight /></span>
              </div>
              <div
                id="account-logout"
                className="setting-row"
                style={{ cursor: 'pointer' }}
                onClick={handleLogout}
              >
                <span className="setting-label" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  Se déconnecter
                </span>
                <span style={{ color: 'var(--placeholder)' }}><ChevronRight /></span>
              </div>
            </div>
          </section>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--placeholder)', marginBottom: 4 }}>
            Stay Close · version 1.0.0
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
