import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import PasswordField from '../components/PasswordField'
import '../components/Screen.css'
import '../components/FormControls.css'
import { register } from '../services/api'

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

    try {
      await register(fullName, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte.')
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
