import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, RefreshCw } from 'lucide-react'

const severityColor: Record<string, string> = {
  Critical: '#9b59b6',
  High: '#e74c3c',
  Medium: '#f39c12',
  Low: '#27ae60',
  Informational: '#8888aa',
}

export default function Incidents() {
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const navigate = useNavigate()


  const fetchIncidents = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/sentinel/incidents')
      const data = await response.json()
      setIncidents(data.incidents)
    } catch {
      setIncidents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncidents()
  }, [])

  const filtered = filter === 'All'
    ? incidents
    : incidents.filter(i => i.severity === filter)

  return (
    <div style={{ padding: '32px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>Incidents</h1>
          <p style={{ color: '#8888aa', marginTop: '6px', fontSize: '14px' }}>
            Microsoft Sentinel — Incident Queue ({incidents.length} total)
          </p>
        </div>
        <button onClick={fetchIncidents} style={{
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
        {['All', 'Critical', 'High', 'Medium', 'Low'].map(f => (
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

      {/* Incident List */}
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
          <ShieldAlert size={48} color='#2a2a4a' style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
            No incidents yet
          </h3>
          <p style={{ color: '#8888aa', fontSize: '13px' }}>
            Start an attack scenario from the Labs page to generate incidents.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(incident => (
            <div key={incident.id}
              onClick={() => navigate(`/incidents/${incident.id}`)}
              style={{
              background: '#1a1a2e',
              border: '1px solid #2a2a4a',
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
            }}>
              {/* Severity Bar */}
              <div style={{
                width: '4px',
                height: '48px',
                borderRadius: '2px',
                background: severityColor[incident.severity] || '#8888aa',
                flexShrink: 0,
              }} />

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                  {incident.title}
                </div>
                <div style={{ fontSize: '12px', color: '#8888aa' }}>
                  {incident.scenarioName} • {incident.alertCount} alerts • {new Date(incident.createdTime).toLocaleString()}
                </div>
              </div>

              {/* Severity Badge */}
              <span style={{
                background: `${severityColor[incident.severity]}22`,
                color: severityColor[incident.severity],
                border: `1px solid ${severityColor[incident.severity]}44`,
                borderRadius: '20px',
                padding: '2px 12px',
                fontSize: '11px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                {incident.severity}
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
                {incident.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}