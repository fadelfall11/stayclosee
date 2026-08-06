import { useState } from 'react'
import './FormControls.css'

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3l18 18M10.6 5.2a10.6 10.6 0 0 1 1.4-.1c5.5 0 9.5 4 11 6.9-.6 1.2-1.7 2.8-3.2 4.2M6.3 6.9C4.1 8.4 2.5 10.5 1.7 12c1.5 2.9 5.5 6.9 11 6.9 1.5 0 2.8-.3 4-.8M9.9 10a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M1.7 12c1.5-2.9 5.5-6.9 10.3-6.9s8.8 4 10.3 6.9c-1.5 2.9-5.5 6.9-10.3 6.9S3.2 14.9 1.7 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function PasswordField({ label, placeholder, value, onChange, id }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="field-input-wrap">
        <input
          id={id}
          className="field-input"
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
        />
        <button
          type="button"
          className="field-icon-btn"
          onClick={() => setVisible((v) => !v)}
          aria-label={
            visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
          }
        >
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      </div>
    </div>
  )
}

export default PasswordField
