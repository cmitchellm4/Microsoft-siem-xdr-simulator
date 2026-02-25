import { ShieldAlert } from 'lucide-react'

const severityColor: Record<string, string> = {
  High: '#e74c3c',
  Medium: '#f39c12',
  Low: '#27ae60',
  Informational: '#8888aa',
}

export default function Incidents() {
  return (
    <div style={{ padding: '32px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>Incidents</h1>
          <p style={{ color: '#8888aa', marginTop: '6px', fontSize: '14px' }}>
            Microsoft Sentinel — Incident Queue
          </p>
        </div>
        <button style={{
          background: '#0078d4',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          + New Incident
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        {['All', 'High', 'Medium', 'Low'].map(f => (
          <button key={f} style={{
            background: f === 'All' ? '#0078d4' : '#1a1a2e',
            color: f === 'All' ? '#ffffff' : '#8888aa',
            border: '1px solid #2a2a4a',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '12px',
            cursor: 'pointer',
          }}>{f}</button>
        ))}
      </div>

      {/* Empty State */}
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
        <p style={{ color: '#8888aa', fontSize: '13px', marginBottom: '20px' }}>
          Start an attack scenario from the Labs page to generate incidents.
        </p>
        <button style={{
          background: '#0078d4',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 20px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          Go to Labs
        </button>
      </div>

    </div>
  )
}