import { Monitor } from 'lucide-react'

export default function Devices() {
  return (
    <div style={{ padding: '32px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>Device Inventory</h1>
        <p style={{ color: '#8888aa', marginTop: '6px', fontSize: '14px' }}>
          Microsoft Defender for Endpoint — Device Inventory
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search devices..."
          style={{
            background: '#1a1a2e',
            border: '1px solid #2a2a4a',
            borderRadius: '6px',
            padding: '8px 16px',
            color: '#ffffff',
            fontSize: '13px',
            width: '300px',
            outline: 'none',
          }}
        />
      </div>

      {/* Table Header */}
      <div style={{
        background: '#1a1a2e',
        border: '1px solid #2a2a4a',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          padding: '12px 16px',
          borderBottom: '1px solid #2a2a4a',
          fontSize: '12px',
          fontWeight: 600,
          color: '#8888aa',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          <div>Device Name</div>
          <div>OS</div>
          <div>Risk Level</div>
          <div>Exposure</div>
          <div>Status</div>
        </div>

        {/* Empty State */}
        <div style={{
          padding: '64px 32px',
          textAlign: 'center',
        }}>
          <Monitor size={48} color='#2a2a4a' style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
            No devices onboarded
          </h3>
          <p style={{ color: '#8888aa', fontSize: '13px' }}>
            Devices will appear here when a scenario is started.
          </p>
        </div>
      </div>

    </div>
  )
}