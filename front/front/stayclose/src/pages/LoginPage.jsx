import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import PasswordField from '../components/PasswordField'
import { GoogleIcon, AppleIcon } from '../components/SocialIcons'
import '../components/Screen.css'
import '../components/FormControls.css'
import { login, saveUser, saveToken } from '../services/api'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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

  const handleSocialLogin = (provider) => {
    const rawName = email.split('@')[0] || provider
    const socialUser = { name: `Utilisateur ${provider}`, email: email || `${provider.toLowerCase()}@stayclose.com` }
    saveToken(`social_${provider.toLowerCase()}_token_` + Date.now())
    saveUser(socialUser)
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
              <button type="button" className="social-btn" onClick={() => handleSocialLogin('Google')}>
                <GoogleIcon />
                Google
              </button>
              <button type="button" className="social-btn" onClick={() => handleSocialLogin('Apple')}>
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
    </div>
  )
}

export default LoginPage
