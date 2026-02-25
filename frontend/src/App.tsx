import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Incidents from './pages/Incidents'
import IncidentDetail from './pages/IncidentDetail'
import Alerts from './pages/Alerts'
import AlertDetail from './pages/AlertDetail'
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
          <Route path="/incidents/:id" element={<IncidentDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/alerts/:id" element={<AlertDetail />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/kql" element={<KQLEditor />} />
          <Route path="/labs" element={<Labs />} />
        </Routes>
      </main>
    </div>
  )
}

export default App