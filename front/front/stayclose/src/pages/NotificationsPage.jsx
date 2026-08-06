import { useState, useEffect } from 'react'
import BottomNav from '../components/BottomNav'
import '../components/AppLayout.css'
import { getStoredContacts, getUser, getNotifications } from '../services/api'

export default function NotificationsPage() {
  const user = getUser()
  const contacts = getStoredContacts()

  // Générer des notifications basées sur les contacts réels de l'utilisateur
  const [notifs, setNotifs] = useState(() => {
    const list = []

    if (contacts.length === 0) {
      list.push({
        id: 'welcome',
        unread: true,
        icon: '👋',
        iconBg: '#fff0ec',
        title: `Bienvenue ${user?.name ? user.name.split(' ')[0] : ''} !`,
        desc: "Commencez par ajouter vos proches depuis l'onglet Contacts pour recevoir des rappels personnalisés.",
        time: "À l'instant",
      })
    } else {
      contacts.forEach((c) => {
        if (c.birthday) {
          list.push({
            id: `bday-${c.id}`,
            unread: true,
            icon: '🎂',
            iconBg: '#fff0ec',
            title: `Anniversaire — ${c.name}`,
            desc: `N'oubliez pas de fêter l'anniversaire de ${c.name} le ${c.birthday} !`,
            time: "Rappel automatique",
          })
        }
        list.push({
          id: `reminder-${c.id}`,
          unread: true,
          icon: '⏰',
          iconBg: '#fff5e6',
          title: `Rappel : Recontacter ${c.name}`,
          desc: `Fréquence souhaitée : ${c.freq || 'Chaque semaine'}. Pensez à lui envoyer un message !`,
          time: "Actif",
        })
      })
    }

    return list
  })

  useEffect(() => {
    getNotifications()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setNotifs(data)
        }
      })
      .catch(() => {})
  }, [])

  const unreadCount = notifs.filter((n) => n.unread).length

  function markAllRead() {
    setNotifs((n) => n.map((x) => ({ ...x, unread: false })))
  }

  function markRead(id) {
    setNotifs((n) => n.map((x) => (x.id === id ? { ...x, unread: false } : x)))
  }

  return (
    <div className="app-page">
      <div className="app-page-inner">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-header-title">Alertes 🔔</h1>
            {unreadCount > 0 && (
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              id="mark-all-read-btn"
              onClick={markAllRead}
              style={{
                background: 'none', border: 'none', fontSize: 13,
                color: 'var(--primary)', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Tout marquer lu
            </button>
          )}
        </div>

        <div className="page-content" style={{ gap: 12 }}>
          {/* Unread section */}
          {notifs.some((n) => n.unread) && (
            <section>
              <div className="section-header">
                <h2 className="section-title">Nouvelles</h2>
              </div>
              <div className="card">
                {notifs.filter((n) => n.unread).map((n, i, arr) => (
                  <div
                    key={n.id}
                    id={`notif-${n.id}`}
                    className="notif-item unread"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onClick={() => markRead(n.id)}
                  >
                    <div className="notif-icon" style={{ background: n.iconBg }}>{n.icon}</div>
                    <div className="notif-body">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-desc">{n.desc}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--primary)', flexShrink: 0, marginTop: 4,
                    }} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Read section */}
          {notifs.some((n) => !n.unread) && (
            <section>
              <div className="section-header">
                <h2 className="section-title">Précédentes</h2>
              </div>
              <div className="card">
                {notifs.filter((n) => !n.unread).map((n, i, arr) => (
                  <div
                    key={n.id}
                    id={`notif-read-${n.id}`}
                    className="notif-item"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div className="notif-icon" style={{ background: n.iconBg, opacity: 0.7 }}>{n.icon}</div>
                    <div className="notif-body">
                      <div className="notif-title" style={{ color: 'var(--text-secondary)' }}>{n.title}</div>
                      <div className="notif-desc">{n.desc}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {notifs.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 }}>
              <span style={{ fontSize: 48 }}>🔔</span>
              <p style={{ margin: 0, fontSize: 15, color: 'var(--text-secondary)', textAlign: 'center' }}>
                Aucune notification pour le moment
              </p>
            </div>
          )}
        </div>
      </div>
      <BottomNav notifCount={unreadCount} />
    </div>
  )
}
