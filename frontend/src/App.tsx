import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Incidents from './pages/Incidents'
import Alerts from './pages/Alerts'
import Devices from './pages/Devices'
import KQLEditor from './pages/KQLEditor'
import Labs from './pages/Labs'

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', background: '#0f0f0f' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/kql" element={<KQLEditor />} />
          <Route path="/labs" element={<Labs />} />
        </Routes>
      </main>
    </div>
  )
}

export default App