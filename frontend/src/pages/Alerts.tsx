import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, RefreshCw } from 'lucide-react'

const severityColor: Record<string, string> = {
  Critical: '#9b59b6',
  High: '#e74c3c',
  Medium: '#f39c12',
  Low: '#27ae60',
  Informational: '#8888aa',
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const navigate = useNavigate()

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/defender/alerts')
      const data = await response.json()
      setAlerts(data.alerts)
    } catch {
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const filtered = filter === 'All'
    ? alerts
    : alerts.filter(a => a.status === filter)

  return (
    <div style={{ padding: '32px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>Alerts</h1>
          <p style={{ color: '#8888aa', marginTop: '6px', fontSize: '14px' }}>
            Microsoft Defender XDR — Alert Queue ({alerts.length} total)
          </p>
        </div>
        <button onClick={fetchAlerts} style={{
          background: '#1a1a2e',
          color: '#8888aa',
          border: '1px solid #2a2a4a',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '13px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['All', 'New', 'InProgress', 'Resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? '#0078d4' : '#1a1a2e',
            color: filter === f ? '#ffffff' : '#8888aa',
            border: '1px solid #2a2a4a',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '12px',
            cursor: 'pointer',
          }}>{f}</button>
        ))}
      </div>

      {/* Alert List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: '#8888aa' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: '8px',
          padding: '64px 32px',
          textAlign: 'center',
        }}>
          <Bell size={48} color='#2a2a4a' style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
            No alerts yet
          </h3>
          <p style={{ color: '#8888aa', fontSize: '13px' }}>
            Start an attack scenario from the Labs page to generate alerts.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(alert => (
            <div
              key={alert.id}
              onClick={() => navigate(`/alerts/${alert.id}`)}
              style={{
                background: '#1a1a2e',
                border: '1px solid #2a2a4a',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#0078d4')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a4a')}
            >
              {/* Severity Bar */}
              <div style={{
                width: '4px',
                height: '48px',
                borderRadius: '2px',
                background: severityColor[alert.severity] || '#8888aa',
                flexShrink: 0,
              }} />

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                  {alert.title}
                </div>
                <div style={{ fontSize: '12px', color: '#8888aa' }}>
                  {alert.product} • {alert.category} • {alert.mitreAttackTechnique} • {new Date(alert.createdTime).toLocaleString()}
                </div>
              </div>

              {/* Severity Badge */}
              <span style={{
                background: `${severityColor[alert.severity]}22`,
                color: severityColor[alert.severity],
                border: `1px solid ${severityColor[alert.severity]}44`,
                borderRadius: '20px',
                padding: '2px 12px',
                fontSize: '11px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                {alert.severity}
              </span>

              {/* Status */}
              <span style={{
                background: '#1a1a2e',
                color: '#8888aa',
                border: '1px solid #2a2a4a',
                borderRadius: '20px',
                padding: '2px 12px',
                fontSize: '11px',
                whiteSpace: 'nowrap',
              }}>
                {alert.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}