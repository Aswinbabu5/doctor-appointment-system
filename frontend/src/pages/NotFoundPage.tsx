import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
      <div className="card" style={{ maxWidth: '480px', padding: '48px 32px' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1, marginBottom: '16px' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>The requested page does not exist or has been moved.</p>
        <Link to="/" className="btn btn-primary" style={{ justifyContent: 'center' }}><Home size={16} /> Return to Homepage</Link>
      </div>
    </div>
  )
}
