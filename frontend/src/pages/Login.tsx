import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DEMO_ACCOUNTS = [
  { email: 'analyst@contoso.com', password: 'SOCtraining1!', role: 'SOC Analyst', level: 'L1' },
  { email: 'senior@contoso.com', password: 'SOCtraining2!', role: 'Senior Analyst', level: 'L2' },
  { email: 'admin@contoso.com', password: 'SOCtraining3!', role: 'Administrator', level: 'Admin' },
]

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError(null)
    setLoading(true)

    await new Promise(r => setTimeout(r, 600))

    const account = DEMO_ACCOUNTS.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    )

    if (account) {
      localStorage.setItem('siem_user', JSON.stringify({
        email: account.email,
        role: account.role,
        level: account.level,
      }))
      navigate('/')
    } else {
      setError('Invalid email or password. Try one of the demo accounts below.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #0078d4, #00b4d8)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 16px',
          }}>🛡️</div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            SIEM & XDR Simulator
          </h1>
          <p style={{ fontSize: '13px', color: '#8888aa' }}>
            Microsoft Security Training Environment
          </p>
        </div>

        {/* Login Form */}
        <div style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '20px',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '24px' }}>
            Sign in to your account
          </h2>

          {error && (
            <div style={{
              background: '#e74c3c22',
              border: '1px solid #e74c3c44',
              borderRadius: '6px',
              padding: '10px 14px',
              fontSize: '12px',
              color: '#e74c3c',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#8888aa', display: 'block', marginBottom: '6px' }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="analyst@contoso.com"
              style={{
                width: '100%',
                background: '#0f0f1a',
                border: '1px solid #2a2a4a',
                borderRadius: '6px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', color: '#8888aa', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••••••"
              style={{
                width: '100%',
                background: '#0f0f1a',
                border: '1px solid #2a2a4a',
                borderRadius: '6px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              background: loading || !email || !password ? '#2a2a4a' : '#0078d4',
              color: loading || !email || !password ? '#8888aa' : '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
            }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        {/* Demo Accounts */}
        <div style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '12px', color: '#8888aa', marginBottom: '12px', fontWeight: 600 }}>
            DEMO ACCOUNTS
          </div>
          {DEMO_ACCOUNTS.map(account => (
            <div
              key={account.email}
              onClick={() => { setEmail(account.email); setPassword(account.password); setError(null) }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: '#0f0f1a',
                borderRadius: '6px',
                border: '1px solid #2a2a4a',
                cursor: 'pointer',
                marginBottom: '6px',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#0078d4')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a4a')}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{account.email}</div>
                <div style={{ fontSize: '11px', color: '#8888aa' }}>{account.password}</div>
              </div>
              <span style={{
                fontSize: '11px',
                color: '#0078d4',
                background: '#0078d422',
                border: '1px solid #0078d444',
                borderRadius: '4px',
                padding: '2px 8px',
              }}>{account.role}</span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#555577', marginTop: '20px' }}>
          Training environment only — not connected to real Microsoft services
        </p>

      </div>
    </div>
  )
}