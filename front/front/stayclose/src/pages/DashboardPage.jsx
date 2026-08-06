import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import '../components/AppLayout.css'
import { getDashboard, getUser, getStoredContacts, saveStoredContacts } from '../services/api'

function Avatar({ initials, size = 40, color = '#fff0ec' }) {
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}
    >
      <span className="avatar-initials">{initials}</span>
    </div>
  )
}

function ActionButtons({ contact }) {
  const handleCall = (e) => {
    e.stopPropagation()
    if (contact?.telephone) {
      window.location.href = `tel:${contact.telephone}`
    } else {
      alert(`📞 Appel en cours vers ${contact?.name || 'le contact'}...`)
    }
  }

  const handleMessage = (e) => {
    e.stopPropagation()
    if (contact?.telephone) {
      window.location.href = `sms:${contact.telephone}`
    } else {
      alert(`💬 Ouverture de la messagerie pour ${contact?.name || 'le contact'}...`)
    }
  }

  const handleEmail = (e) => {
    e.stopPropagation()
    if (contact?.email) {
      window.location.href = `mailto:${contact.email}`
    } else {
      alert(`✉️ Envoi d'un e-mail à ${contact?.name || 'le contact'}...`)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
      <button onClick={handleCall} style={{
        flex: 1, height: 30, borderRadius: 8,
        border: '1px solid var(--border)',
        background: '#fff', fontSize: 11.5, fontWeight: 600,
        color: 'var(--primary)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
      }}>
        <span style={{ fontSize: 12 }}>📞</span>Appeler
      </button>
      <button onClick={handleMessage} style={{
        flex: 1, height: 30, borderRadius: 8,
        border: '1px solid var(--border)',
        background: '#fff', fontSize: 11.5, fontWeight: 600,
        color: 'var(--primary)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
      }}>
        <span style={{ fontSize: 12 }}>💬</span>Message
      </button>
      <button onClick={handleEmail} style={{
        flex: 1, height: 30, borderRadius: 8,
        border: '1px solid var(--border)',
        background: '#fff', fontSize: 11.5, fontWeight: 600,
        color: 'var(--primary)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
      }}>
        <span style={{ fontSize: 12 }}>✉️</span>Email
      </button>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = getUser()
  const userName = user?.name ? user.name.split(' ')[0] : 'à vous'

  const [contacts, setContacts] = useState(() => getStoredContacts())
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newFreq, setNewFreq] = useState('Chaque semaine')
  const [newBirthday, setNewBirthday] = useState('')

  useEffect(() => {
    getDashboard()
      .then(data => {
        if (data?.contacts && Array.isArray(data.contacts)) {
          setContacts(data.contacts)
        }
      })
      .catch(() => {})
  }, [])

  const handleAddContact = (e) => {
    e.preventDefault()
    if (!newName.trim()) return

    const initials = newName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'C'

    const newContactObj = {
      id: Date.now(),
      name: newName,
      telephone: newPhone || null,
      email: newEmail || null,
      initials,
      color: '#e8f3ec',
      freq: newFreq,
      birthday: newBirthday || null,
      lastContact: 0,
      tag: 'À jour',
      tagType: 'green',
    }

    const updated = [newContactObj, ...contacts]
    setContacts(updated)
    saveStoredContacts(updated)
    setNewName('')
    setNewPhone('')
    setNewEmail('')
    setNewBirthday('')
    setShowAddModal(false)
  }

  // Filtrer les contacts avec anniversaire renseigné
  const birthdays = contacts.filter(c => c.birthday || c.sub)

  return (
    <div className="app-page">
      <div className="app-page-inner">
        {/* Header */}
        <div className="page-header">
          <div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Keep in Touch</p>
            <h1 className="page-header-title">Bonjour {userName} 👋</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              width: 38, height: 38, borderRadius: 12,
              border: 'none',
              background: 'var(--primary)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', fontSize: 20, color: '#fff',
            }}
            title="Ajouter un contact"
          >
            +
          </button>
        </div>

        <div className="page-content">
          {/* Anniversaires */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Anniversaires à venir 🎂</h2>
              <span onClick={() => navigate('/contacts')} className="section-link">Voir tout</span>
            </div>
            {birthdays.length === 0 ? (
              <div className="card" style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p style={{ margin: 0, fontSize: 13.5 }}>Aucun anniversaire enregistré pour le moment.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                {birthdays.map((b) => (
                  <div key={b.id} className="card" style={{ minWidth: 140, flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Avatar initials={b.initials} size={46} color={b.color || '#fde8d8'} />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{b.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--text-secondary)' }}>{b.sub || b.birthday}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* À recontacter */}
          <section>
            <div className="section-header">
              <h2 className="section-title">À recontacter 🔔</h2>
            </div>
            {contacts.length === 0 ? (
              <div className="card" style={{ padding: '32px 20px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Aucun contact enregistré</p>
                <p style={{ margin: '6px 0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                  Enregistrez vos proches pour recevoir des rappels et garder le contact.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    padding: '10px 18px', borderRadius: 10, border: 'none',
                    background: 'var(--primary)', color: '#fff', fontWeight: 600,
                    fontSize: 13.5, cursor: 'pointer'
                  }}
                >
                  + Enregistrer mon premier contact
                </button>
              </div>
            ) : (
              <div className="card">
                {contacts.map((c, i) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '14px 16px',
                      borderBottom: i < contacts.length - 1 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate('/contacts')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar initials={c.initials} size={40} color={c.color || '#f3ece8'} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</span>
                          <span className={`chip chip-${c.tagType || 'green'}`}>{c.tag || 'À jour'}</span>
                        </div>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                          {c.sub || `${c.freq || 'Rappel'} · il y a ${c.lastContact ?? 0}j`}
                        </p>
                      </div>
                    </div>
                    <ActionButtons contact={c} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal d'ajout de contact */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 390, padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>Nouveau Contact</h3>
            <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Nom complet</label>
                <input
                  type="text"
                  placeholder="Ex: David Cho"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', marginTop: 4, borderRadius: 10,
                    border: '1px solid var(--border)', outline: 'none', fontSize: 14
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Téléphone (Optionnel)</label>
                <input
                  type="tel"
                  placeholder="Ex: +33 6 12 34 56 78"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', marginTop: 4, borderRadius: 10,
                    border: '1px solid var(--border)', outline: 'none', fontSize: 14
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Email (Optionnel)</label>
                <input
                  type="email"
                  placeholder="Ex: contact@email.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', marginTop: 4, borderRadius: 10,
                    border: '1px solid var(--border)', outline: 'none', fontSize: 14
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Fréquence de contact</label>
                <select
                  value={newFreq}
                  onChange={e => setNewFreq(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', marginTop: 4, borderRadius: 10,
                    border: '1px solid var(--border)', outline: 'none', fontSize: 14, background: '#fff'
                  }}
                >
                  <option value="Chaque semaine">Chaque semaine</option>
                  <option value="Toutes les 2 semaines">Toutes les 2 semaines</option>
                  <option value="Chaque mois">Chaque mois</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Date d'anniversaire (Optionnel)</label>
                <input
                  type="date"
                  value={newBirthday}
                  onChange={e => setNewBirthday(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', marginTop: 4, borderRadius: 10,
                    border: '1px solid var(--border)', outline: 'none', fontSize: 14
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border)',
                    background: '#fff', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                    background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav notifCount={0} />
    </div>
  )
}
