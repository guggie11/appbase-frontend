import { Link } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'

export function ForbiddenPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F5', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {/* Icon */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldOff size={36} style={{ color: '#D94F3D' }} />
        </div>

        <div>
          <div style={{ fontSize: 64, fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>403</div>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D94F3D', marginTop: 8 }}>
            Access Forbidden
          </div>
        </div>

        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
          You don't have permission to access this page. Contact your administrator if you believe this is an error.
        </p>

        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 24px',
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 6,
            background: '#D94F3D',
            color: 'white',
            textDecoration: 'none',
            transition: 'background 150ms',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#C0392B' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#D94F3D' }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
