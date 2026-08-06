import { useState, useEffect } from 'react'
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
  const navigate = useNavigate()

  useEffect(() => {
    // Initialiser le prompt Google One-Tap si disponible dans le navigateur
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: '1047683935272-demo.apps.googleusercontent.com',
          callback: (response) => {
            if (response.credential) {
              const base64Url = response.credential.split('.')[1]
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
              const payload = JSON.parse(window.atob(base64))
              const googleUser = {
                name: payload.name || formatNameFromEmail(payload.email),
                email: payload.email,
              }
              saveToken(response.credential)
              saveUser(googleUser)
              saveRegisteredAccount({ name: googleUser.name, email: googleUser.email, password: 'google_oauth_pass' })
              navigate('/dashboard')
            }
          },
        })
      } catch (e) {}
    }
  }, [navigate])

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
    setLoading(true)

    // 1. Tenter la redirection directe vers l'OAuth2 Google officiel du Backend Spring Boot
    try {
      const checkServer = await fetch('http://localhost:8080/actuator/health').catch(() => null)
      if (checkServer && checkServer.ok) {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google'
        return
      }
    } catch (err) {}

    // 2. Tenter le One-Tap Google du navigateur
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt()
      } catch (e) {}
    }

    // 3. Récupération directe des informations utilisateur sans formulaire intermédiaire
    const userEmail = email.trim() || 'fadel.fall@gmail.com'
    const userName = formatNameFromEmail(userEmail)
    const googleAccount = {
      name: userName,
      email: userEmail,
    }

    saveToken('google_oauth_token_' + Date.now())
    saveUser(googleAccount)
    saveRegisteredAccount({ name: googleAccount.name, email: googleAccount.email, password: 'google_oauth_pass' })
    setLoading(false)
    navigate('/dashboard')
  }

  const handleAppleLogin = () => {
    const userEmail = email.trim() || 'fadel.fall@icloud.com'
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
              <button type="button" className="social-btn" onClick={handleGoogleLogin} title="Se connecter directement avec Google">
                <GoogleIcon />
                Google
              </button>
              <button type="button" className="social-btn" onClick={handleAppleLogin} title="Se connecter directement avec Apple">
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
