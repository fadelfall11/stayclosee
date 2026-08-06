import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import PasswordField from '../components/PasswordField'
import { GoogleIcon, AppleIcon } from '../components/SocialIcons'
import '../components/Screen.css'
import '../components/FormControls.css'
import { login, saveUser, saveToken, saveRegisteredAccount, formatNameFromEmail } from '../services/api'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Erreur de connexion. Veuillez vérifier vos identifiants.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    try {
      // Tenter la connexion OAuth2 Google du backend Spring Boot si le serveur tourne
      const checkServer = await fetch('http://localhost:8080/actuator/health').catch(() => null)
      if (checkServer && checkServer.ok) {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google'
        return
      }
    } catch (err) {}

    // Si un e-mail a déjà été saisi dans le champ, on l'utilise pour déduire le nom
    if (email.trim()) {
      const nameFromEmail = formatNameFromEmail(email)
      const googleAccount = { name: nameFromEmail, email: email.trim() }
      saveToken('google_oauth_token_' + Date.now())
      saveUser(googleAccount)
      saveRegisteredAccount({ name: googleAccount.name, email: googleAccount.email, password: 'google_oauth_pass' })
      navigate('/dashboard')
      return
    }

    // Sinon, afficher la fenêtre pop-up Google pour saisir son compte Google réel
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
    const userEmail = email.trim() || 'fadel.apple@icloud.com'
    const userName = formatNameFromEmail(userEmail)
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
            <h1 className="screen-title">Connexion</h1>
            <p className="screen-subtitle">Ravi de vous revoir ! Connectez-vous.</p>
          </div>

          <div className="form-stack">
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
              placeholder="·······"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span className="forgot-link">Mot de passe oublié ?</span>
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
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </button>

            <div className="divider-row">
              <span>Ou continuer avec</span>
            </div>

            <div className="social-row">
              <button type="button" className="social-btn" onClick={handleGoogleLogin} title="Se connecter avec Google">
                <GoogleIcon />
                Google
              </button>
              <button type="button" className="social-btn" onClick={handleAppleLogin} title="Se connecter avec Apple">
                <AppleIcon />
                Apple
              </button>
            </div>

            <p className="screen-footer-text">
              Pas encore de compte ?{' '}
              <Link to="/signup" className="link">
                S'inscrire
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Modal de sélection de compte Google réel */}
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
              Connexion avec Google
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 12.5, color: 'var(--text-secondary)' }}>
              Entrez votre compte Google pour personnaliser vos réglages.
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
                  Se connecter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
