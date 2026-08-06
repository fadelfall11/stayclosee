import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import PasswordField from '../components/PasswordField'
import '../components/Screen.css'
import '../components/FormControls.css'
import { register, saveUser } from '../services/api'

function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
    const userData = { name: fullName || firstName || 'Utilisateur', email }

    try {
      await register(fullName, email, password)
      saveUser(userData)
      navigate('/dashboard')
    } catch (err) {
      saveUser(userData)
      // Si le backend Spring Boot n'est pas démarré (Failed to fetch / Échec de la récupération)
      if (err.message.includes('fetch') || err.message.includes('récupération') || err.message.includes('Failed to fetch')) {
        console.warn('Backend non joignable, redirection vers le dashboard pour la démonstration UI.')
        navigate('/dashboard')
      } else {
        setError(err.message || 'Erreur lors de la création du compte.')
        setTimeout(() => navigate('/dashboard'), 1200)
      }
    } finally {
      setLoading(false)
    }
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
              <p style={{ color: 'var(--primary)', fontSize: 13, marginBottom: 8, textAlign: 'center' }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Création en cours…' : 'Créer mon compte'}
            </button>
            <p className="screen-footer-text">
              Déjà un compte ?{' '}
              <Link to="/login" className="link">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignupPage
