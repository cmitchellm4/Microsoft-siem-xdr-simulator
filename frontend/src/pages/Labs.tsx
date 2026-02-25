import { useState } from 'react'
import { Clock, Target, CheckCircle, Loader, RotateCcw } from 'lucide-react'
import LabQuestions from '../components/LabQuestions'

const scenarios = [
  {
    id: 'bec-invoice-fraud-001',
    name: 'Business Email Compromise — Invoice Fraud',
    difficulty: 'Beginner',
    minutes: 20,
    tags: ['BEC', 'Phishing', 'M365'],
    description: 'Investigate an account takeover via AiTM phishing leading to fraudulent wire transfer.',
  },
  {
    id: 'ransomware-lockbit-001',
    name: 'LockBit Ransomware Campaign',
    difficulty: 'Intermediate',
    minutes: 30,
    tags: ['Ransomware', 'Lateral Movement', 'Credential Theft'],
    description: 'Track a full ransomware attack chain from phishing email to mass file encryption.',
  },
]

const difficultyColor: Record<string, string> = {
  Beginner: '#27ae60',
  Intermediate: '#f39c12',
  Advanced: '#e74c3c',
  Expert: '#9b59b6',
}

export default function Labs() {
  const [loading, setLoading] = useState<string | null>(null)
  const [started, setStarted] = useState<Record<string, any>>({})
  const [error, setError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [activeScenario, setActiveScenario] = useState<string | null>(null)

  const handleStart = async (scenarioId: string) => {
    setLoading(scenarioId)
    setError(null)
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/labs/scenarios/${scenarioId}/start`,
        { method: 'POST' }
      )
      const data = await response.json()
      setStarted(prev => ({ ...prev, [scenarioId]: data }))
      setActiveScenario(scenarioId)
    } catch {
      setError('Could not connect to backend. Make sure the server is running.')
    } finally {
      setLoading(null)
    }
  }

  const handleReset = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/v1/labs/reset', { method: 'POST' })
      setStarted({})
      setError(null)
      setActiveScenario(null)
      setResetSuccess(true)
      setTimeout(() => setResetSuccess(false), 3000)
    } catch {
      setError('Could not connect to backend. Make sure the server is running.')
    }
  }

  return (
    <div style={{ padding: '32px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>Labs & Scenarios</h1>
          <p style={{ color: '#8888aa', marginTop: '6px', fontSize: '14px' }}>
            Launch attack scenarios and complete guided labs to build your skills.
          </p>
        </div>
        <button
          onClick={handleReset}
          style={{
            background: '#1a1a2e',
            color: '#e74c3c',
            border: '1px solid #e74c3c44',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
          <RotateCcw size={14} />
          Reset Environment
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#e74c3c22',
          border: '1px solid #e74c3c',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          color: '#e74c3c',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {/* Reset Success */}
      {resetSuccess && (
        <div style={{
          background: '#27ae6022',
          border: '1px solid #27ae6044',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          color: '#27ae60',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <CheckCircle size={14} />
          Environment reset successfully. All incidents and alerts cleared.
        </div>
      )}

      {/* Scenario Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {scenarios.map(scenario => {
          const result = started[scenario.id]
          const isLoading = loading === scenario.id
          const isStarted = !!result

          return (
            <div key={scenario.id} style={{
              background: '#1a1a2e',
              border: `1px solid ${isStarted ? '#27ae6044' : '#2a2a4a'}`,
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', flex: 1, marginRight: '12px' }}>
                  {scenario.name}
                </h3>
                <span style={{
                  background: `${difficultyColor[scenario.difficulty]}22`,
                  color: difficultyColor[scenario.difficulty],
                  border: `1px solid ${difficultyColor[scenario.difficulty]}44`,
                  borderRadius: '20px',
                  padding: '2px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  {scenario.difficulty}
                </span>
              </div>

              <p style={{ fontSize: '12px', color: '#8888aa', lineHeight: '1.5' }}>
                {scenario.description}
              </p>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {scenario.tags.map(tag => (
                  <span key={tag} style={{
                    background: '#0f0f1a',
                    border: '1px solid #2a2a4a',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    color: '#8888aa',
                  }}>{tag}</span>
                ))}
              </div>

              {isStarted && (
                <div style={{
                  background: '#27ae6022',
                  border: '1px solid #27ae6044',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: '#27ae60',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <CheckCircle size={14} />
                  {result.message}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#8888aa' }}>
                  <Clock size={12} />
                  ~{scenario.minutes} min
                </div>
                <button
                  onClick={() => handleStart(scenario.id)}
                  disabled={isLoading || isStarted}
                  style={{
                    background: isStarted ? '#27ae6033' : '#0078d4',
                    color: isStarted ? '#27ae60' : '#ffffff',
                    border: isStarted ? '1px solid #27ae6044' : 'none',
                    borderRadius: '6px',
                    padding: '6px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: isLoading || isStarted ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                  {isLoading
                    ? <Loader size={12} />
                    : isStarted
                    ? <CheckCircle size={12} />
                    : <Target size={12} />
                  }
                  {isLoading ? 'Starting...' : isStarted ? 'Started' : 'Start Lab'}
                </button>
              </div>

              {/* Lab Questions Panel */}
              {isStarted && activeScenario === scenario.id && (
                <LabQuestions
                  scenarioId={scenario.id}
                  scenarioName={scenario.name}
                />
              )}

            </div>
          )
        })}
      </div>

    </div>
  )
}