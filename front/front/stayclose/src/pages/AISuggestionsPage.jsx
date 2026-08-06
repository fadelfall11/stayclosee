import { useState } from 'react'
import BottomNav from '../components/BottomNav'
import '../components/AppLayout.css'
import { getStoredContacts, getUser } from '../services/api'

// ─── Moteur de suggestions IA (local, basé sur les données utilisateur) ──────
function generateSuggestions(contacts, userName) {
  const suggestions = []
  const now = new Date()
  const firstName = userName?.split(' ')[0] || 'vous'

  if (contacts.length === 0) {
    return [{
      id: 'onboarding',
      type: 'tip',
      icon: '🚀',
      iconBg: '#fff0ec',
      title: 'Commencez par ajouter des contacts',
      message: `Bonjour ${firstName} ! Pour recevoir des suggestions personnalisées, ajoutez vos proches depuis l'onglet Contacts. L'IA analysera ensuite vos habitudes pour vous proposer des conseils adaptés.`,
      action: null,
    }]
  }

  // Suggestion anniversaires proches
  contacts.forEach(c => {
    if (!c.birthday) return
    const bday = new Date(c.birthday)
    const thisYear = new Date(bday.getFullYear() !== now.getFullYear()
      ? `${now.getFullYear()}-${String(bday.getMonth() + 1).padStart(2, '0')}-${String(bday.getDate()).padStart(2, '0')}`
      : c.birthday)
    const daysUntil = Math.ceil((thisYear - now) / (1000 * 60 * 60 * 24))

    if (daysUntil >= 0 && daysUntil <= 14) {
      suggestions.push({
        id: `bday-${c.id}`,
        type: 'birthday',
        icon: '🎂',
        iconBg: '#fff0ec',
        title: `Anniversaire de ${c.name} dans ${daysUntil === 0 ? "aujourd'hui !" : `${daysUntil}j`}`,
        message: daysUntil === 0
          ? `C'est aujourd'hui l'anniversaire de ${c.name} ! Envoyez-lui un message dès maintenant pour lui souhaiter.`
          : `Dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}, c'est l'anniversaire de ${c.name}. Pensez à préparer un message ou un appel.`,
        action: c.telephone ? `sms:${c.telephone}` : (c.email ? `mailto:${c.email}` : null),
        actionLabel: c.telephone ? '💬 Envoyer un SMS' : (c.email ? '✉️ Envoyer un email' : null),
        priority: 'high',
      })
    }
  })

  // Suggestions de contact selon fréquence
  const freqToDays = {
    'Chaque semaine': 7,
    'Toutes les 2 semaines': 14,
    'Chaque mois': 30,
    'Chaque trimestre': 90,
  }

  contacts.forEach(c => {
    const maxDays = freqToDays[c.freq] || 7
    const lastDays = c.lastContact ?? 0
    if (lastDays >= maxDays) {
      suggestions.push({
        id: `overdue-${c.id}`,
        type: 'reminder',
        icon: '⏰',
        iconBg: '#fff5e6',
        title: `Recontacter ${c.name}`,
        message: `Vous n'avez pas contacté ${c.name} depuis ${lastDays} jour${lastDays > 1 ? 's' : ''}. Votre objectif est de le/la contacter ${c.freq.toLowerCase()}. Un simple message peut faire toute la différence !`,
        action: c.telephone ? `sms:${c.telephone}` : (c.email ? `mailto:${c.email}` : null),
        actionLabel: c.telephone ? '💬 Envoyer un SMS' : (c.email ? '✉️ Envoyer un email' : null),
        priority: lastDays >= maxDays * 2 ? 'high' : 'medium',
      })
    }
  })

  // Suggestion générale de bien-être social
  if (contacts.length >= 3) {
    suggestions.push({
      id: 'wellbeing',
      type: 'tip',
      icon: '💡',
      iconBg: '#f0fdf4',
      title: 'Conseil relationnel du jour',
      message: getRandomTip(firstName),
      action: null,
    })
  }

  // Suggestion si peu de contacts avec téléphone
  const withPhone = contacts.filter(c => c.telephone).length
  if (contacts.length > 0 && withPhone < contacts.length) {
    suggestions.push({
      id: 'add-phones',
      type: 'tip',
      icon: '📞',
      iconBg: '#eff6ff',
      title: 'Complétez vos contacts',
      message: `${contacts.length - withPhone} contact${contacts.length - withPhone > 1 ? 's' : ''} n'ont pas de numéro de téléphone. Ajoutez leurs coordonnées pour pouvoir les appeler ou leur envoyer un SMS directement depuis l'app.`,
      action: null,
    })
  }

  return suggestions.sort((a, b) => {
    const order = { high: 0, medium: 1, undefined: 2 }
    return (order[a.priority] ?? 2) - (order[b.priority] ?? 2)
  })
}

const TIPS = [
  (name) => `Les relations se maintiennent avec de petites attentions régulières, ${name}. Un message de 3 mots peut illuminer la journée de quelqu'un.`,
  (name) => `La qualité prime sur la quantité. Mieux vaut quelques vrais liens solides que de nombreuses connaissances superficielles.`,
  (name) => `Essayez d'appeler plutôt que d'envoyer un message de temps en temps, ${name}. La voix crée un lien plus fort.`,
  (name) => `Partagez une photo souvenir avec un proche aujourd'hui, ${name}. C'est une façon simple de montrer que vous pensez à lui/elle.`,
  (name) => `Demandez des nouvelles d'un proche que vous n'avez pas vu depuis longtemps. Cela prendra 2 minutes et marquera sa journée.`,
]

function getRandomTip(name) {
  return TIPS[Math.floor(Math.random() * TIPS.length)](name)
}

const priorityColors = {
  high: { bg: '#fff0ec', dot: '#ff8174', label: 'Urgent' },
  medium: { bg: '#fff8ec', dot: '#f59e0b', label: 'Bientôt' },
}

export default function AISuggestionsPage() {
  const user = getUser()
  const contacts = getStoredContacts()
  const suggestions = generateSuggestions(contacts, user?.name)

  const [dismissed, setDismissed] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      text: `Bonjour ${user?.name?.split(' ')[0] || ''} 👋 Je suis votre assistant relationnel. Je peux vous aider à améliorer vos liens avec vos proches. Posez-moi une question !`,
    }
  ])

  const visibleSuggestions = suggestions.filter(s => !dismissed.includes(s.id))

  const handleChatSend = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const question = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', text: question }])
    setChatInput('')
    setIsTyping(true)

    // Simulation d'une réponse IA basée sur les contacts
    setTimeout(() => {
      const reply = generateAIReply(question, contacts, user?.name)
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <div className="app-page">
      <div className="app-page-inner">
        {/* Header */}
        <div className="page-header">
          <div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Assistant IA</p>
            <h1 className="page-header-title">Suggestions ✨</h1>
          </div>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, #ff8174, #f59e0b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            🤖
          </div>
        </div>

        <div className="page-content">
          {/* Suggestions cards */}
          {visibleSuggestions.length === 0 ? (
            <div className="card" style={{ padding: '32px 20px', textAlign: 'center' }}>
              <span style={{ fontSize: 48 }}>🎉</span>
              <p style={{ margin: '12px 0 4px', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
                Tout est à jour !
              </p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                Vous êtes un excellent proche. Revenez demain pour de nouvelles suggestions.
              </p>
            </div>
          ) : (
            <section>
              <div className="section-header">
                <h2 className="section-title">Suggestions du jour 📋</h2>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {visibleSuggestions.length} suggestion{visibleSuggestions.length > 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {visibleSuggestions.map(s => (
                  <div key={s.id} className="card" style={{
                    padding: '16px',
                    borderLeft: s.priority ? `3px solid ${priorityColors[s.priority]?.dot}` : '3px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: s.iconBg, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, flexShrink: 0,
                      }}>
                        {s.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{s.title}</span>
                          {s.priority && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 7px',
                              borderRadius: 20, background: priorityColors[s.priority]?.bg,
                              color: priorityColors[s.priority]?.dot, flexShrink: 0,
                            }}>
                              {priorityColors[s.priority]?.label}
                            </span>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {s.message}
                        </p>
                        {s.action && s.actionLabel && (
                          <a
                            href={s.action}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              marginTop: 10, padding: '7px 14px', borderRadius: 10,
                              background: 'var(--primary)', color: '#fff',
                              fontWeight: 600, fontSize: 12.5, textDecoration: 'none',
                            }}
                          >
                            {s.actionLabel}
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => setDismissed(d => [...d, s.id])}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--placeholder)', fontSize: 16, padding: 0,
                          lineHeight: 1, flexShrink: 0,
                        }}
                        title="Ignorer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* IA Chat */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Assistant IA 🤖</h2>
            </div>
            <div className="card" style={{ overflow: 'visible' }}>
              {/* Messages */}
              <div style={{
                maxHeight: 300, overflowY: 'auto',
                padding: '12px 16px',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{
                      maxWidth: '82%', padding: '9px 13px', borderRadius: 14,
                      background: msg.role === 'user'
                        ? 'var(--primary)'
                        : 'var(--primary-soft-bg)',
                      color: msg.role === 'user' ? '#fff' : 'var(--text)',
                      fontSize: 13.5, lineHeight: 1.5,
                      borderBottomRightRadius: msg.role === 'user' ? 4 : 14,
                      borderBottomLeftRadius: msg.role === 'ai' ? 4 : 14,
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{
                      padding: '9px 13px', borderRadius: 14, borderBottomLeftRadius: 4,
                      background: 'var(--primary-soft-bg)', fontSize: 18,
                    }}>
                      <span style={{ animation: 'pulse 1s infinite' }}>💭</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleChatSend} style={{
                display: 'flex', gap: 8, padding: '12px 12px',
                borderTop: '1px solid var(--border)',
              }}>
                <input
                  type="text"
                  placeholder="Posez une question à l'IA…"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  style={{
                    flex: 1, padding: '9px 12px', borderRadius: 10,
                    border: '1px solid var(--border)', outline: 'none',
                    fontSize: 13.5, background: 'var(--input-bg)', color: 'var(--text)',
                  }}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  style={{
                    width: 38, height: 38, borderRadius: 10, border: 'none',
                    background: chatInput.trim() ? 'var(--primary)' : 'var(--border)',
                    color: '#fff', cursor: 'pointer', fontSize: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  ➤
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

// ─── Réponses IA simulées (intelligentes selon contexte) ─────────────────────
function generateAIReply(question, contacts, userName) {
  const q = question.toLowerCase()
  const name = userName?.split(' ')[0] || 'vous'
  const count = contacts.length

  // ── Salutations ──
  if (q.match(/\b(bonjour|salut|hello|coucou|hey|bonsoir|hi)\b/)) {
    return `Bonjour ${name} ! 😊 Je suis votre assistant relationnel. Vous avez ${count} contact${count > 1 ? 's' : ''} enregistré${count > 1 ? 's' : ''}. Comment puis-je vous aider aujourd'hui ?`
  }

  // ── Cadeaux / idées de cadeaux ──
  if (q.match(/cadeau|offrir|donner|id[eé]e|pr[eé]sent|gift/)) {
    const giftIdeas = [
      `🎁 Voici quelques idées de cadeaux originaux pour un ami :\n\n• Un carnet personnalisé avec vos photos ensemble\n• Une expérience partagée (cours de cuisine, sortie, escape game…)\n• Un abonnement à une app, livre ou podcast qu'il aime\n• Un bon restaurant ou spa\n• Une plante (symbolise la croissance et le soin)\n\nLe meilleur cadeau reste celui qui montre que vous le/la connaissez bien 💛`,
      `🎁 Pour un cadeau mémorable, pensez à ce que votre ami aime :\n\n• Passion sport → équipement ou expérience sportive\n• Passion cuisine → livre de recettes ou cours\n• Passion musique → concert ou bons écouteurs\n• Passion voyages → guide, organiseur de voyage\n• Passion détente → bougie, diffuseur, massage\n\nUn cadeau personnalisé vaut toujours plus qu'un cadeau cher mais impersonnel ! ✨`,
      `🎁 Avec un petit budget, ces idées touchent beaucoup :\n\n• Une lettre manuscrite sincère (rarissime aujourd'hui !)\n• Un album photo de vos souvenirs communs\n• Un plat ou dessert fait maison\n• Une playlist musicale compilée spécialement pour lui/elle\n• Un "bon pour une sortie" avec vous quand il/elle veut\n\nSouvent ce sont les attentions gratuites qui marquent le plus 💌`,
    ]
    return giftIdeas[Math.floor(Math.random() * giftIdeas.length)]
  }

  // ── Anniversaire ──
  if (q.match(/anniversaire|birthday|f[eê]ter|\\bage\\b/)) {
    const withBday = contacts.filter(c => c.birthday)
    if (withBday.length === 0) {
      return `🎂 Aucun de vos contacts n'a de date d'anniversaire enregistrée.\n\nAllez dans l'onglet Contacts, cliquez sur un contact pour y ajouter sa date. Je vous enverrai des rappels automatiques avant le jour J !`
    }
    return `🎂 Vous avez ${withBday.length} contact${withBday.length > 1 ? 's' : ''} avec un anniversaire enregistré : ${withBday.map(c => c.name).join(', ')}.\n\nJe surveille leurs dates et vous avertirai dans Alertes et ici dans Suggestions !`
  }

  // ── Combien de contacts ──
  if (q.match(/combien|nombre|total/) && q.match(/contact|ami|proche|personne/)) {
    return count === 0
      ? `Vous n'avez encore aucun contact enregistré, ${name}. Allez dans l'onglet Contacts et appuyez sur + pour en ajouter !`
      : `Vous avez ${count} contact${count > 1 ? 's' : ''} enregistré${count > 1 ? 's' : ''}, ${name}. ${count < 3 ? "Pensez à en ajouter d'autres pour un suivi complet !" : count < 8 ? "C'est un cercle proche, facile à maintenir !" : "Vous avez un grand réseau, bravo !"}`
  }

  // ── Appel téléphonique ──
  if (q.match(/appeler|appel|t[eé]l[eé]phone|ring|sonner/)) {
    const withPhone = contacts.filter(c => c.telephone)
    if (withPhone.length === 0) return `📞 Aucun de vos contacts n'a de numéro de téléphone. Éditez un contact dans l'onglet Contacts pour ajouter son numéro — le bouton Appeler fonctionnera directement !`
    return `📞 Vous pouvez appeler ${withPhone.map(c => c.name).join(', ')} directement depuis l'app.\n\nAllez dans Contacts, appuyez sur un contact et utilisez le bouton 📞 Appeler.`
  }

  // ── SMS / message ──
  if (q.match(/sms|texto|messagerie|whatsapp|envoyer un message/)) {
    const withPhone = contacts.filter(c => c.telephone)
    if (withPhone.length === 0) return `💬 Pour envoyer un SMS depuis l'app, ajoutez un numéro de téléphone à vos contacts dans l'onglet Contacts.`
    return `💬 Pour envoyer un SMS : allez dans Contacts, cliquez sur un contact, puis appuyez sur 💬 SMS. Votre application de messagerie s'ouvrira avec le numéro pré-rempli !\n\nFonctionne avec : ${withPhone.map(c => c.name).join(', ')}.`
  }

  // ── Email ──
  if (q.match(/email|mail|courriel|gmail|outlook/)) {
    const withEmail = contacts.filter(c => c.email)
    if (withEmail.length === 0) return `✉️ Aucun de vos contacts n'a d'email enregistré. Ajoutez des emails dans l'onglet Contacts pour utiliser le bouton Email.`
    return `✉️ Vous pouvez envoyer un email à : ${withEmail.map(c => c.name).join(', ')}.\n\nDans Contacts → cliquez sur un contact → ✉️ Email.`
  }

  // ── Que faire avec un ami / activité ──
  if (q.match(/que faire|quoi faire|activit[eé]|sortie|sortir|s.amuser|passer du temps|voir/)) {
    const activities = [
      `🎯 Idées d'activités avec un ami :\n\n• Escape game ou laser game\n• Soirée jeux de société\n• Randonnée ou balade en vélo\n• Cours de cuisine ensemble\n• Cinéma + restaurant\n• Pique-nique au parc\n• Atelier créatif (poterie, peinture…)\n\nL'important c'est d'être ensemble, pas l'activité elle-même ! 😊`,
      `🎯 Pour des activités sympas avec un ami :\n\n• Sportif → salle de sport, piscine, tennis\n• Curieux → musée, expo, conférence\n• Gourmand → marché, atelier cuisine, restaurant\n• Créatif → atelier poterie, dessin, DIY\n• Chill → Netflix + canapé, jeux vidéo, karaoké\n\nAdaptez l'activité à sa personnalité et il/elle adorera ! 💛`,
    ]
    return activities[Math.floor(Math.random() * activities.length)]
  }

  // ── Conseils relationnels ──
  if (q.match(/conseil|astuce|am[eé]liorer|entretenir|relation|amiti[eé]|lien|aide/)) {
    const tips = [
      `Partagez un souvenir commun avec un proche aujourd'hui. Une vieille photo ou une anecdote suffit à raviver une relation.`,
      `La régularité bat l'intensité. Un message simple toutes les 2 semaines vaut mieux qu'un long appel tous les 6 mois.`,
    ]
    return tips[Math.floor(Math.random() * tips.length)]
  }

  if (q.includes('appeler') || q.includes('appel') || q.includes('téléphone')) {
    const withPhone = contacts.filter(c => c.telephone)
    if (withPhone.length === 0) return `📞 Aucun contact n'a de numéro. Ajoutez-en dans l'onglet Contacts !`
    return `📞 Appuyez sur un contact dans Contacts puis 📞 Appeler.`
  }

  if (q.includes('sms') || q.includes('texto')) {
    const withPhone = contacts.filter(c => c.telephone)
    if (withPhone.length === 0) return `💬 Ajoutez un numéro à vos contacts pour envoyer des SMS.`
    return `💬 Contacts → appuyez sur un contact → 💬 SMS. Votre messagerie s'ouvre avec le numéro pré-rempli !`
  }

  if (q.includes('merci') || q.includes('super') || q.includes('parfait') || q.includes('ok')) {
    return `Avec plaisir ${name} ! 💛 N'oubliez pas : une petite attention régulière vaut mieux qu'un grand geste rare.`
  }

  // ── Réponses génériques anti-répétition ──
  const genericPool = [
    `Je ne suis pas sûr d'avoir compris, ${name} 🤔 Essayez : "idée de cadeau pour mon ami", "que faire avec un ami", "conseil pour améliorer une amitié", ou "qui contacter aujourd'hui ?".`,
    `Précisez votre demande ${name} 😊 Je peux vous aider avec : des idées de cadeaux 🎁, des activités à faire ensemble 🎯, des conseils relationnels 💡, ou des infos sur vos contacts.`,
    `Reformulez votre question ! Par exemple : "idée cadeau ami sportif", "comment renouer avec quelqu'un", "qui dois-je appeler ?" ou "quoi faire ce week-end avec un ami" 😊`,
    `Je suis spécialisé dans les relations sociales 💛 Demandez-moi une idée de cadeau, un conseil pour une amitié, une activité avec un proche, ou comment utiliser une fonctionnalité de l'app !`,
    `Hm, je n'ai pas compris, ${name}. Soyez plus précis ! Par exemple : "j'ai un ami sportif, idée de cadeau ?", "comment reprendre contact après longtemps ?", ou "que faire ce weekend ?".`,
  ]

  // Rotation basée sur l'heure pour éviter la répétition (change toutes les 3 secondes)
  const rotationIndex = Math.floor(Date.now() / 3000) % genericPool.length
  return genericPool[rotationIndex]
}
