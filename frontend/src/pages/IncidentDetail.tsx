import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldAlert, Clock, Tag, User, Monitor } from 'lucide-react'

const severityColor: Record<string, string> = {
  Critical: '#9b59b6',
  High: '#e74c3c',
  Medium: '#f39c12',
  Low: '#27ae60',
  Informational: '#8888aa',
}

const mitreColors: Record<string, string> = {
  'T1566': '#e74c3c',
  'T1078': '#f39c12',
  'T1059': '#e67e22',
  'T1003': '#9b59b6',
  'T1550': '#8e44ad',
  'T1486': '#c0392b',
  'T1564': '#2980b9',
  'T1114': '#16a085',
}

const tacticLabels: Record<string, string> = {
  'T1566.001': 'Initial Access',
  'T1566.002': 'Initial Access',
  'T1078.004': 'Defense Evasion',
  'T1059.001': 'Execution',
  'T1003.001': 'Credential Access',
  'T1550.002': 'Lateral Movement',
  'T1486':     'Impact',
  'T1564.008': 'Defense Evasion',
  'T1114.002': 'Collection',
}

export default function IncidentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [incident, setIncident] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/sentinel/incidents/${id}`)
        const data = await res.json()
        setIncident(data)

        // Fetch all alerts and filter to this incident's alert IDs
        const alertRes = await fetch('http://127.0.0.1:8000/api/v1/defender/alerts')
        const alertData = await alertRes.json()
        const filtered = alertData.alerts.filter((a: any) =>
          data.alertIds?.includes(a.id)
        )
        setAlerts(filtered)
      } catch {
        setIncident(null)
      } finally {
        setLoading(false)
      }
    }
    fetchIncident()
  }, [id])

  if (loading) return (
    <div style={{ padding: '32px', color: '#8888aa' }}>Loading...</div>
  )

  if (!incident) return (
    <div style={{ padding: '32px', color: '#e74c3c' }}>Incident not found.</div>
  )

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>

      {/* Back Button */}
      <button onClick={() => navigate('/incidents')} style={{
        background: 'transparent',
        border: 'none',
        color: '#8888aa',
        fontSize: '13px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '24px',
        padding: 0,
      }}>
        <ArrowLeft size={14} /> Back to Incidents
      </button>

      {/* Header */}
      <div style={{
        background: '#1a1a2e',
        border: '1px solid #2a2a4a',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={24} color={severityColor[incident.severity]} />
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
              {incident.title}
            </h1>
          </div>
          <span style={{
            background: `${severityColor[incident.severity]}22`,
            color: severityColor[incident.severity],
            border: `1px solid ${severityColor[incident.severity]}44`,
            borderRadius: '20px',
            padding: '4px 16px',
            fontSize: '12px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}>
            {incident.severity}
          </span>
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8888aa' }}>
            <Clock size={12} />
            {new Date(incident.createdTime).toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8888aa' }}>
            <Tag size={12} />
            Status: <span style={{ color: '#ffffff' }}>{incident.status}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8888aa' }}>
            <ShieldAlert size={12} />
            {incident.alertCount} alerts
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: '13px', color: '#aaaacc', lineHeight: '1.6' }}>
          {incident.description}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Affected Entities */}
        <div style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '16px' }}>
            Affected Entities
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {incident.entities?.map((entity: string) => {
              const isDevice = !entity.includes('@')
              return (
                <div key={entity} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  background: '#0f0f1a',
                  borderRadius: '6px',
                  border: '1px solid #2a2a4a',
                  fontSize: '13px',
                  color: '#ffffff',
                }}>
                  {isDevice
                    ? <Monitor size={14} color='#0078d4' />
                    : <User size={14} color='#27ae60' />
                  }
                  {entity}
                </div>
              )
            })}
          </div>
        </div>

        {/* MITRE ATT&CK */}
        <div style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '16px' }}>
            MITRE ATT&CK Techniques
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {incident.mitreAttackTechniques?.map((technique: string) => {
              const prefix = technique.split('.')[0]
              const color = mitreColors[prefix] || '#0078d4'
              const tactic = tacticLabels[technique] || 'Unknown'
              return (
                <div key={technique} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#0f0f1a',
                  borderRadius: '6px',
                  border: `1px solid ${color}33`,
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: color,
                    fontFamily: 'monospace',
                  }}>
                    {technique}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: '#8888aa',
                    background: '#1a1a2e',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #2a2a4a',
                  }}>
                    {tactic}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Alert Timeline */}
      <div style={{
        background: '#1a1a2e',
        border: '1px solid #2a2a4a',
        borderRadius: '8px',
        padding: '20px',
      }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '20px' }}>
          Alert Timeline
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {alerts.map((alert, index) => (
            <div key={alert.id} style={{ display: 'flex', gap: '16px' }}>

              {/* Timeline line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: severityColor[alert.severity] || '#8888aa',
                  marginTop: '4px',
                  flexShrink: 0,
                }} />
                {index < alerts.length - 1 && (
                  <div style={{
                    width: '2px',
                    flex: 1,
                    background: '#2a2a4a',
                    margin: '4px 0',
                    minHeight: '24px',
                  }} />
                )}
              </div>

              {/* Alert Content */}
              <div style={{
                flex: 1,
                paddingBottom: index < alerts.length - 1 ? '16px' : '0',
              }}>
                <div style={{
                  background: '#0f0f1a',
                  border: '1px solid #2a2a4a',
                  borderRadius: '6px',
                  padding: '12px 16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                      {alert.title}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: severityColor[alert.severity],
                      fontWeight: 600,
                      marginLeft: '12px',
                      whiteSpace: 'nowrap',
                    }}>
                      {alert.severity}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#8888aa', lineHeight: '1.5', marginBottom: '8px' }}>
                    {alert.description}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: '#0078d4' }}>{alert.product}</span>
                    <span style={{ fontSize: '11px', color: '#8888aa' }}>•</span>
                    <span style={{ fontSize: '11px', color: '#8888aa', fontFamily: 'monospace' }}>{alert.mitreAttackTechnique}</span>
                    <span style={{ fontSize: '11px', color: '#8888aa' }}>•</span>
                    <span style={{ fontSize: '11px', color: '#8888aa' }}>{alert.entity}</span>
                  </div>
                </div>
              </div>

            </div>
          ))}

          {alerts.length === 0 && (
            <div style={{ color: '#8888aa', fontSize: '13px', textAlign: 'center', padding: '32px' }}>
              No alerts found for this incident.
            </div>
          )}
        </div>
      </div>

    </div>
  )
}