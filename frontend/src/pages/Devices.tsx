import { useEffect, useState } from 'react'
import { Monitor, RefreshCw, Server, AlertTriangle } from 'lucide-react'

const riskColor: Record<string, string> = {
  Critical: '#9b59b6',
  High: '#e74c3c',
  Medium: '#f39c12',
  Low: '#27ae60',
}

export default function Devices() {
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const fetchDevices = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/defender/devices')
      const data = await res.json()
      setDevices(data.devices)
    } catch {
      setDevices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  const filtered = devices
    .filter(d => filter === 'All' || d.riskLevel === filter)
    .filter(d =>
      search === '' ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.owner.toLowerCase().includes(search.toLowerCase()) ||
      d.ipAddress.includes(search)
    )

  const isServer = (name: string) => name.startsWith('SRV')

  return (
    <div style={{ padding: '32px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>Device Inventory</h1>
          <p style={{ color: '#8888aa', marginTop: '6px', fontSize: '14px' }}>
            Microsoft Defender for Endpoint — {devices.length} devices onboarded
          </p>
        </div>
        <button onClick={fetchDevices} style={{
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

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by name, owner, or IP..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: '#1a1a2e',
            border: '1px solid #2a2a4a',
            borderRadius: '6px',
            padding: '8px 16px',
            color: '#ffffff',
            fontSize: '13px',
            width: '280px',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
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
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: '#8888aa' }}>Loading...</div>
      ) : (
        <div style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 0.5fr',
            padding: '12px 20px',
            borderBottom: '1px solid #2a2a4a',
            fontSize: '11px',
            fontWeight: 600,
            color: '#8888aa',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            <div>Device Name</div>
            <div>Owner</div>
            <div>OS</div>
            <div>IP Address</div>
            <div>Risk Level</div>
            <div>Status</div>
            <div>Alerts</div>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#8888aa', fontSize: '13px' }}>
              No devices match your search.
            </div>
          ) : (
            filtered.map((device, index) => (
              <div key={device.id} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 0.5fr',
                padding: '14px 20px',
                borderBottom: index < filtered.length - 1 ? '1px solid #2a2a4a' : 'none',
                alignItems: 'center',
                transition: 'background 0.1s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0f0f1a')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Device Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: `${riskColor[device.riskLevel]}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isServer(device.name)
                      ? <Server size={16} color={riskColor[device.riskLevel]} />
                      : <Monitor size={16} color={riskColor[device.riskLevel]} />
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{device.name}</div>
                    <div style={{ fontSize: '11px', color: '#8888aa' }}>{device.domain}</div>
                  </div>
                </div>

                {/* Owner */}
                <div style={{ fontSize: '12px', color: '#aaaacc' }}>{device.owner}</div>

                {/* OS */}
                <div>
                  <div style={{ fontSize: '12px', color: '#ffffff' }}>{device.os}</div>
                  <div style={{ fontSize: '11px', color: '#8888aa' }}>{device.osVersion}</div>
                </div>

                {/* IP */}
                <div style={{ fontSize: '12px', color: '#aaaacc', fontFamily: 'monospace' }}>{device.ipAddress}</div>

                {/* Risk Level */}
                <div>
                  <span style={{
                    background: `${riskColor[device.riskLevel]}22`,
                    color: riskColor[device.riskLevel],
                    border: `1px solid ${riskColor[device.riskLevel]}44`,
                    borderRadius: '20px',
                    padding: '2px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}>
                    {device.riskLevel}
                  </span>
                </div>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#27ae60',
                  }} />
                  <span style={{ fontSize: '12px', color: '#27ae60' }}>{device.status}</span>
                </div>

                {/* Active Alerts */}
                <div>
                  {device.activeAlerts > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} color='#e74c3c' />
                      <span style={{ fontSize: '12px', color: '#e74c3c', fontWeight: 600 }}>
                        {device.activeAlerts}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#8888aa' }}>—</span>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* Tags Summary */}
      {!loading && filtered.length > 0 && (
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Array.from(new Set(filtered.flatMap(d => d.tags))).map(tag => (
            <span key={tag} style={{
              background: '#1a1a2e',
              border: '1px solid #2a2a4a',
              borderRadius: '4px',
              padding: '2px 10px',
              fontSize: '11px',
              color: '#8888aa',
            }}>{tag}</span>
          ))}
        </div>
      )}

    </div>
  )
}