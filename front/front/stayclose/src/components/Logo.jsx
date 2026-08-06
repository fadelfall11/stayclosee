import './Logo.css'

function Logo({ size = 64 }) {
  return (
    <div className="logo-badge" style={{ width: size, height: size }}>
      <svg
        width={size * 0.44}
        height={size * 0.44}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3"
          y="2"
          width="14"
          height="20"
          rx="3"
          transform="rotate(-8 10 12)"
          stroke="var(--icon-stroke)"
          strokeWidth="1.4"
        />
        <circle cx="8.6" cy="8.4" r="1.6" fill="var(--icon-stroke)" />
        <circle cx="15.2" cy="11.2" r="1.6" fill="var(--icon-stroke)" />
        <circle cx="9.6" cy="16.4" r="1.6" fill="var(--icon-stroke)" />
        <line
          x1="8.6"
          y1="8.4"
          x2="15.2"
          y2="11.2"
          stroke="var(--icon-stroke)"
          strokeWidth="1.2"
        />
        <line
          x1="15.2"
          y1="11.2"
          x2="9.6"
          y2="16.4"
          stroke="var(--icon-stroke)"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  )
}

export default Logo
