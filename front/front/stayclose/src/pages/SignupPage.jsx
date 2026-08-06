import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import PasswordField from '../components/PasswordField'
import { GoogleIcon, AppleIcon } from '../components/SocialIcons'
import '../components/Screen.css'
import '../components/FormControls.css'
import { register, saveUser, saveToken, saveRegisteredAccount, formatNameFromEmail } from '../services/api'

function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Google Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [googleName, setGoogleName] = useState('')
  const [googleEmail, setGoogleEmail] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (!accepted) {
      setError("Veuillez accepter les conditions d'utilisation.")
      return
    }

    setLoading(true)
    const fullName = `${firstName} ${lastName}`.trim()

    try {
      await register(fullName, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    try {
      const checkServer = await fetch('http://localhost:8080/actuator/health').catch(() => null)
      if (checkServer && checkServer.ok) {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google'
        return
      }
    } catch (err) {}

    const typedName = `${firstName} ${lastName}`.trim()
    if (typedName || email.trim()) {
      const googleAccount = {
        name: typedName || formatNameFromEmail(email),
        email: email.trim() || 'votre.email@gmail.com',
      }
      saveToken('google_oauth_token_' + Date.now())
      saveUser(googleAccount)
      saveRegisteredAccount({ name: googleAccount.name, email: googleAccount.email, password: 'google_oauth_pass' })
      navigate('/dashboard')
      return
    }

    setGoogleName('')
    setGoogleEmail('')
    setShowGoogleModal(true)
  }

  const handleConfirmGoogleModal = (e) => {
    e.preventDefault()
    if (!googleName.trim() || !googleEmail.trim()) return

    const googleAccount = {
      name: googleName.trim(),
      email: googleEmail.trim(),
    }
    saveToken('google_oauth_token_' + Date.now())
    saveUser(googleAccount)
    saveRegisteredAccount({ name: googleAccount.name, email: googleAccount.email, password: 'google_oauth_pass' })
    setShowGoogleModal(false)
    navigate('/dashboard')
  }

  const handleAppleLogin = () => {
    const typedName = `${firstName} ${lastName}`.trim()
    const userEmail = email.trim() || 'utilisateur.apple@icloud.com'
    const userName = typedName || formatNameFromEmail(userEmail)
    const appleAccount = { name: userName, email: userEmail }
    saveToken('apple_oauth_token_' + Date.now())
    saveUser(appleAccount)
    saveRegisteredAccount({ name: appleAccount.name, email: appleAccount.email, password: 'apple_oauth_pass' })
    navigate('/dashboard')
  }

  return (
    <div className="screen">
      <div className="screen-inner">
        <div className="screen-header">
          <Logo size={56} />
        </div>

        <form className="screen-body" style={{ justifyContent: 'flex-start' }} onSubmit={handleSubmit}>
          <div style={{ textAlign: 'left' }}>
            <h1 className="screen-title">Créer un compte</h1>
            <p className="screen-subtitle">Rejoignez Keep in Touch dès aujourd'hui.</p>
          </div>

          <div className="form-stack">
            <div className="form-row">
              <div className="field">
                <label className="field-label" htmlFor="firstName">
                  Prénom
                </label>
                <div className="field-input-wrap">
                  <input
                    id="firstName"
                    className="field-input"
                    style={{ paddingRight: 14 }}
                    placeholder="David"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="lastName">
                  Nom
                </label>
                <div className="field-input-wrap">
                  <input
                    id="lastName"
                    className="field-input"
                    style={{ paddingRight: 14 }}
                    placeholder="Cho"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="email">
                Adresse e-mail
              </label>
              <div className="field-input-wrap">
                <input
                  id="email"
                  type="email"
                  className="field-input"
                  style={{ paddingRight: 14 }}
                  placeholder="david.cho@stripe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <PasswordField
              id="password"
              label="Mot de passe"
              placeholder="········"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <PasswordField
              id="confirmPassword"
              label="Confirmer le mot de passe"
              placeholder="········"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="checkbox-row">
              <input
                type="checkbox"
                id="terms"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <label htmlFor="terms">J'accepte les conditions d'utilisation</label>
            </div>
          </div>

          <div className="screen-footer" style={{ marginTop: 8 }}>
            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                marginBottom: 12, textAlign: 'center'
              }}>
                ⚠️ {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Création en cours…' : 'Créer mon compte'}
            </button>

            <div className="divider-row">
              <span>Ou continuer avec</span>
            </div>

            <div className="social-row">
              <button type="button" className="social-btn" onClick={handleGoogleLogin} title="S'inscrire avec Google">
                <GoogleIcon />
                Google
              </button>
              <button type="button" className="social-btn" onClick={handleAppleLogin} title="S'inscrire avec Apple">
                <AppleIcon />
                Apple
              </button>
            </div>

            <p className="screen-footer-text">
              Déjà un compte ?{' '}
              <Link to="/signup" className="link">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Modal Google Account prompt */}
      {showGoogleModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20
        }} onClick={() => setShowGoogleModal(false)}>
          <div style={{
            background: 'var(--card-bg)', borderRadius: 20, width: '100%', maxWidth: 380, padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', textAlign: 'center'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <GoogleIcon />
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
              Inscription avec Google
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 12.5, color: 'var(--text-secondary)' }}>
              Entrez votre compte Google pour créer votre profil.
            </p>
            <form onSubmit={handleConfirmGoogleModal} style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Votre nom complet *</label>
                <input
                  type="text"
                  placeholder="Ex: Fadel Fall"
                  value={googleName}
                  onChange={e => setGoogleName(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', marginTop: 4, borderRadius: 10,
                    border: '1px solid var(--border)', outline: 'none', fontSize: 14,
                    background: 'var(--input-bg)', color: 'var(--text)'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Votre adresse e-mail Google *</label>
                <input
                  type="email"
                  placeholder="Ex: fadel.fall@gmail.com"
                  value={googleEmail}
                  onChange={e => setGoogleEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', marginTop: 4, borderRadius: 10,
                    border: '1px solid var(--border)', outline: 'none', fontSize: 14,
                    background: 'var(--input-bg)', color: 'var(--text)'
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowGoogleModal(false)} style={{
                  flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border)',
                  background: 'var(--card-bg)', fontWeight: 600, cursor: 'pointer', color: 'var(--text)'
                }}>
                  Annuler
                </button>
                <button type="submit" style={{
                  flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                  background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer'
                }}>
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SignupPage
