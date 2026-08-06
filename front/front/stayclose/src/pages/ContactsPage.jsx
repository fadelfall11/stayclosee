import { useState, useEffect } from 'react'
import BottomNav from '../components/BottomNav'
import '../components/AppLayout.css'
import { getContacts, createContact, getStoredContacts, saveStoredContacts } from '../services/api'

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

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

function ContactActionButtons({ contact, onDelete }) {
  const handleCall = (e) => {
    e.stopPropagation()
    if (contact?.telephone) {
      window.location.href = `tel:${contact.telephone}`
    } else {
      alert(`📞 Aucun numéro enregistré pour ${contact?.name}`)
    }
  }

  const handleMessage = (e) => {
    e.stopPropagation()
    if (contact?.telephone) {
      window.location.href = `sms:${contact.telephone}`
    } else {
      alert(`💬 Aucun numéro enregistré pour ${contact?.name}`)
    }
  }

  const handleEmail = (e) => {
    e.stopPropagation()
    if (contact?.email) {
      window.location.href = `mailto:${contact.email}`
    } else {
      alert(`✉️ Aucun email enregistré pour ${contact?.name}`)
    }
  }

  const btnStyle = {
    flex: 1, height: 30, borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--card-bg)', fontSize: 11.5, fontWeight: 600,
    color: 'var(--primary)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    transition: 'background 0.15s',
  }

  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 8 }} onClick={e => e.stopPropagation()}>
      <button onClick={handleCall} style={btnStyle}>📞 Appeler</button>
      <button onClick={handleMessage} style={btnStyle}>💬 SMS</button>
      <button onClick={handleEmail} style={btnStyle}>✉️ Email</button>
    </div>
  )
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState(() => getStoredContacts())
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  // Form fields
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newFreq, setNewFreq] = useState('Chaque semaine')
  const [newBirthday, setNewBirthday] = useState('')

  useEffect(() => {
    getContacts()
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setContacts(data)
          saveStoredContacts(data)
        }
      })
      .catch(() => {})
  }, [])

  const handleAddContact = async (e) => {
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

    try {
      await createContact(newContactObj)
    } catch (err) {}

    const updated = [newContactObj, ...contacts]
    setContacts(updated)
    saveStoredContacts(updated)
    setNewName('')
    setNewPhone('')
    setNewEmail('')
    setNewBirthday('')
    setShowAddModal(false)
  }

  const handleDelete = (id) => {
    const updated = contacts.filter(c => c.id !== id)
    setContacts(updated)
    saveStoredContacts(updated)
  }

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const inputStyle = {
    width: '100%', padding: '10px 12px', marginTop: 4, borderRadius: 10,
    border: '1px solid var(--border)', outline: 'none', fontSize: 14,
    background: 'var(--input-bg)', color: 'var(--text)',
  }

  return (
    <div className="app-page">
      <div className="app-page-inner">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-header-title">Contacts</h1>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              width: 38, height: 38, borderRadius: 12,
              border: 'none',
              background: 'var(--primary)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#fff',
            }}
            aria-label="Ajouter un contact"
          >
            <PlusIcon />
          </button>
        </div>

        <div className="page-content">
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--card-bg)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '10px 14px',
          }}>
            <span style={{ color: 'var(--placeholder)' }}><SearchIcon /></span>
            <input
              id="contacts-search"
              type="text"
              placeholder="Rechercher un contact…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                flex: 1, fontSize: 14, color: 'var(--text)',
              }}
            />
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Total',    value: contacts.length,                                   color: 'var(--primary-soft-bg)' },
              { label: 'En retard', value: contacts.filter(c => c.tagType === 'red').length, color: '#fff0ec' },
              { label: 'À jour',   value: contacts.filter(c => c.tagType === 'green').length, color: '#ecfdf5' },
            ].map(s => (
              <div key={s.label} className="card" style={{ flex: 1, padding: '14px 10px', textAlign: 'center', background: s.color, border: 'none' }}>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{s.value}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* List */}
          <div className="card">
            {filtered.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--placeholder)', fontSize: 14 }}>
                {contacts.length === 0
                  ? 'Aucun contact — appuyez sur + pour en ajouter'
                  : 'Aucun contact trouvé'}
              </div>
            )}
            {filtered.map((c, i) => {
              const isExpanded = expandedId === c.id
              return (
                <div
                  key={c.id}
                  id={`contact-${c.id}`}
                  style={{
                    padding: '14px 16px',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar initials={c.initials} size={44} color={c.color || '#e8ecf3'} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>{c.name}</span>
                        <span className={`chip chip-${c.tagType || 'green'}`} style={{ flexShrink: 0 }}>{c.tag || 'À jour'}</span>
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                        {c.freq} · il y a {c.lastContact ?? 0}j
                        {c.telephone && <span style={{ marginLeft: 6 }}>· 📞</span>}
                        {c.email && <span style={{ marginLeft: 4 }}>✉️</span>}
                      </p>
                    </div>
                  </div>

                  {/* Expanded actions */}
                  {isExpanded && (
                    <div onClick={e => e.stopPropagation()}>
                      <ContactActionButtons contact={c} />
                      {c.birthday && (
                        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                          🎂 Anniversaire : {c.birthday}
                        </p>
                      )}
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{
                          marginTop: 8, width: '100%', padding: '7px', borderRadius: 8,
                          border: '1px solid #fecaca', background: '#fff5f5',
                          color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        🗑️ Supprimer ce contact
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modal d'ajout de contact */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200,
        }} onClick={() => setShowAddModal(false)}>
          <div
            style={{
              background: 'var(--card-bg)', borderRadius: '20px 20px 0 0', width: '100%',
              maxWidth: 430, padding: '24px 20px 36px',
              boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
              maxHeight: '90svh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 4, margin: '0 auto 20px' }} />
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Nouveau Contact</h3>
            <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Nom complet *</label>
                <input type="text" placeholder="Ex: Thomas Dubois" value={newName}
                  onChange={e => setNewName(e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>📞 Téléphone (pour Appeler / SMS)</label>
                <input type="tel" placeholder="Ex: +33 6 12 34 56 78" value={newPhone}
                  onChange={e => setNewPhone(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>✉️ Email</label>
                <input type="email" placeholder="Ex: thomas@email.com" value={newEmail}
                  onChange={e => setNewEmail(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Fréquence de contact</label>
                <select value={newFreq} onChange={e => setNewFreq(e.target.value)} style={inputStyle}>
                  <option value="Chaque semaine">Chaque semaine</option>
                  <option value="Toutes les 2 semaines">Toutes les 2 semaines</option>
                  <option value="Chaque mois">Chaque mois</option>
                  <option value="Chaque trimestre">Chaque trimestre</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>🎂 Date d'anniversaire (Optionnel)</label>
                <input type="date" value={newBirthday}
                  onChange={e => setNewBirthday(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--border)',
                    background: 'var(--card-bg)', fontWeight: 600, cursor: 'pointer', color: 'var(--text)', fontSize: 14 }}>
                  Annuler
                </button>
                <button type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                    background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
