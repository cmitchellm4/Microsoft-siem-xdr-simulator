import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShieldAlert,
  Bell,
  Monitor,
  Terminal,
  FlaskConical
} from 'lucide-react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/incidents', icon: ShieldAlert, label: 'Incidents' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/devices', icon: Monitor, label: 'Devices' },
  { path: '/kql', icon: Terminal, label: 'KQL Editor' },
  { path: '/labs', icon: FlaskConical, label: 'Labs' },
]

export default function Sidebar() {
  return (
    <div style={{
      width: '220px',
      minWidth: '220px',
      background: '#1a1a2e',
      borderRight: '1px solid #2a2a4a',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid #2a2a4a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #0078d4, #00b4d8)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}>🛡️</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>SIEM & XDR</div>
            <div style={{ fontSize: '10px', color: '#8888aa' }}>Simulator</div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '6px',
              marginBottom: '2px',
              color: isActive ? '#ffffff' : '#8888aa',
              background: isActive ? '#0078d4' : 'transparent',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #2a2a4a',
        fontSize: '11px',
        color: '#555577',
      }}>
        v0.1.0 — Training Only
      </div>
    </div>
  )
}