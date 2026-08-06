import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import '../components/Screen.css'
import '../components/FormControls.css'

function WelcomePage() {
  return (
    <div className="screen">
      <div className="screen-inner">
        <div className="screen-body" style={{ alignItems: 'center', textAlign: 'center' }}>
          <Logo size={72} />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '18px 0 4px' }}>
              Keep in Touch
            </h1>
            <p className="screen-tagline">Proches, à chaque instant</p>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '32px 0 0', lineHeight: 1.3 }}>
            Gardez le lien avec ceux qui comptent
          </h2>
        </div>

        <div className="screen-footer" style={{ marginTop: 0 }}>
          <Link to="/login" className="btn btn-primary">
            Se connecter
          </Link>
          <Link to="/signup" className="btn btn-outline">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage
