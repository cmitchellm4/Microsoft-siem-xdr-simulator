import { useState, useEffect } from 'react'
import { Terminal, Play, Trophy, CheckCircle, XCircle, HelpCircle } from 'lucide-react'

const exampleQueries = [
  { label: 'All sign-in events', query: 'SignInLogs\n| take 50' },
  { label: 'Failed sign-ins', query: 'SignInLogs\n| where Status == "Failure"\n| project TimeGenerated, UserPrincipalName, IPAddress\n| take 50' },
  { label: 'Process events', query: 'DeviceProcessEvents\n| take 50' },
  { label: 'Count alerts by severity', query: 'SecurityAlert\n| summarize Count = count() by AlertSeverity\n| order by Count desc' },
]

const difficultyColor: Record<string, string> = {
  Beginner: '#27ae60',
  Intermediate: '#f39c12',
  Advanced: '#e74c3c',
}

export default function KQLEditor() {
  const [tab, setTab] = useState<'editor' | 'challenges'>('editor')
  const [query, setQuery] = useState('SignInLogs\n| take 10')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Challenges state
  const [challenges, setChallenges] = useState<any[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [activeChallenge, setActiveChallenge] = useState<any>(null)
  const [challengeQuery, setChallengeQuery] = useState('')
  const [challengeResult, setChallengeResult] = useState<any>(null)
  const [showHint, setShowHint] = useState(false)
  const [completedChallenges, setCompletedChallenges] = useState<Record<string, any>>({})
  const [score, setScore] = useState(0)
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/sentinel/kql-challenges')
      .then(r => r.json())
      .then(data => {
        setChallenges(data.challenges)
        setTotalPoints(data.total_points)
      })
      .catch(() => setChallenges([]))
  }, [])

  const runQuery = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/sentinel/query/kql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await response.json()
      setResults(data)
    } catch {
      setError('Could not connect to backend. Make sure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const validateChallenge = async () => {
    if (!activeChallenge || !challengeQuery.trim()) return
    setValidating(true)
    setChallengeResult(null)
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/v1/sentinel/kql-challenges/${activeChallenge.id}/validate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: challengeQuery }),
        }
      )
      const data = await res.json()
      setChallengeResult(data)
      if (data.passed && !completedChallenges[activeChallenge.id]) {
        setCompletedChallenges(prev => ({ ...prev, [activeChallenge.id]: data }))
        setScore(prev => prev + data.points_awarded)
      }
    } finally {
      setValidating(false)
    }
  }

  return (
    <div style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>KQL Editor</h1>
        <p style={{ color: '#8888aa', marginTop: '6px', fontSize: '14px' }}>
          Microsoft Sentinel — Log Analytics Query Editor
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid #2a2a4a', paddingBottom: '0' }}>
        {[
          { id: 'editor', label: 'Query Editor' },
          { id: 'challenges', label: `KQL Challenges ${score > 0 ? `• ${score}pts` : ''}` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            background: 'transparent',
            color: tab === t.id ? '#ffffff' : '#8888aa',
            border: 'none',
            borderBottom: tab === t.id ? '2px solid #0078d4' : '2px solid transparent',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: tab === t.id ? 600 : 400,
            cursor: 'pointer',
            marginBottom: '-1px',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Query Editor Tab */}
      {tab === 'editor' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#8888aa', alignSelf: 'center' }}>Examples:</span>
            {exampleQueries.map(({ label, query: q }) => (
              <button key={label} onClick={() => setQuery(q)} style={{
                background: '#1a1a2e',
                color: '#0078d4',
                border: '1px solid #2a2a4a',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12px',
                cursor: 'pointer',
              }}>{label}</button>
            ))}
          </div>

          <div style={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #2a2a4a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#8888aa' }}>
                <Terminal size={14} />
                KQL Query
              </div>
              <button onClick={runQuery} disabled={loading} style={{
                background: loading ? '#444' : '#0078d4',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Play size={12} />
                {loading ? 'Running...' : 'Run Query'}
              </button>
            </div>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: '100%',
                height: '160px',
                background: '#0f0f1a',
                color: '#00ff88',
                border: 'none',
                padding: '16px',
                fontSize: '13px',
                fontFamily: 'Consolas, Monaco, monospace',
                resize: 'vertical',
                outline: 'none',
                lineHeight: '1.6',
              }}
            />
          </div>

          {error && (
            <div style={{ background: '#e74c3c22', border: '1px solid #e74c3c', borderRadius: '6px', padding: '12px 16px', fontSize: '13px', color: '#e74c3c', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          {results && (
            <div style={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '8px', overflow: 'hidden', flex: 1 }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #2a2a4a', fontSize: '12px', color: '#8888aa', display: 'flex', justifyContent: 'space-between' }}>
                <span>Results</span>
                <span>{results.row_count ?? 0} rows</span>
              </div>
              {results.error ? (
                <div style={{ padding: '16px', color: '#e74c3c', fontSize: '13px' }}>{results.error}</div>
              ) : results.rows?.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#8888aa', fontSize: '13px' }}>
                  Query returned no results.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#0f0f1a' }}>
                        {results.columns?.map((col: string) => (
                          <th key={col} style={{ padding: '8px 16px', textAlign: 'left', color: '#8888aa', fontWeight: 600, borderBottom: '1px solid #2a2a4a', whiteSpace: 'nowrap' }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.rows?.map((row: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid #1a1a2e' }}>
                          {results.columns?.map((col: string) => (
                            <td key={col} style={{ padding: '8px 16px', color: '#cccccc', whiteSpace: 'nowrap' }}>{String(row[col] ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Challenges Tab */}
      {tab === 'challenges' && (
        <div style={{ display: 'flex', gap: '20px', flex: 1 }}>

          {/* Challenge List */}
          <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#8888aa' }}>
                {Object.keys(completedChallenges).length} / {challenges.length} completed
              </span>
              <span style={{ fontSize: '13px', color: '#f39c12', fontWeight: 700 }}>
                {score} / {totalPoints} pts
              </span>
            </div>
            {challenges.map(challenge => {
              const completed = completedChallenges[challenge.id]
              const isActive = activeChallenge?.id === challenge.id
              return (
                <div
                  key={challenge.id}
                  onClick={() => { setActiveChallenge(challenge); setChallengeQuery(''); setChallengeResult(null); setShowHint(false) }}
                  style={{
                    background: isActive ? '#0f0f2a' : '#1a1a2e',
                    border: `1px solid ${isActive ? '#0078d4' : completed ? '#27ae6044' : '#2a2a4a'}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                      {challenge.title}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '11px',
                        color: difficultyColor[challenge.difficulty],
                        fontWeight: 600,
                      }}>{challenge.difficulty}</span>
                      <span style={{ fontSize: '11px', color: '#8888aa' }}>• {challenge.points} pts</span>
                    </div>
                  </div>
                  {completed && <CheckCircle size={16} color='#27ae60' />}
                </div>
              )
            })}
          </div>

          {/* Challenge Editor */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {!activeChallenge ? (
              <div style={{
                background: '#1a1a2e',
                border: '1px solid #2a2a4a',
                borderRadius: '8px',
                padding: '64px 32px',
                textAlign: 'center',
                flex: 1,
              }}>
                <Trophy size={48} color='#2a2a4a' style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
                  Select a challenge to get started
                </h3>
                <p style={{ color: '#8888aa', fontSize: '13px' }}>
                  Complete KQL challenges to build your query skills and earn points.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>

                {/* Challenge Description */}
                <div style={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{activeChallenge.title}</h3>
                    <span style={{ fontSize: '12px', color: '#f39c12', fontWeight: 700 }}>{activeChallenge.points} pts</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#aaaacc', lineHeight: '1.5' }}>{activeChallenge.description}</p>
                </div>

                {/* Hint */}
                {showHint && (
                  <div style={{ background: '#f39c1222', border: '1px solid #f39c1244', borderRadius: '6px', padding: '10px 14px', fontSize: '12px', color: '#f39c12', display: 'flex', gap: '8px' }}>
                    <HelpCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                    {activeChallenge.hint}
                  </div>
                )}

                {/* Result */}
                {challengeResult && (
                  <div style={{
                    background: challengeResult.passed ? '#27ae6022' : '#e74c3c22',
                    border: `1px solid ${challengeResult.passed ? '#27ae6044' : '#e74c3c44'}`,
                    borderRadius: '6px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: challengeResult.passed ? '#27ae60' : '#e74c3c',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}>
                    {challengeResult.passed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{challengeResult.feedback}</div>
                      {challengeResult.passed && challengeResult.example_solution && (
                        <div style={{ fontSize: '12px', color: '#8888aa', marginTop: '8px' }}>
                          Example solution:
                          <pre style={{ fontFamily: 'monospace', color: '#00ff88', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                            {challengeResult.example_solution}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Query Editor */}
                <div style={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '8px', overflow: 'hidden', flex: 1 }}>
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #2a2a4a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#8888aa' }}>
                      <Terminal size={14} />
                      Write your query
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setShowHint(!showHint)} style={{
                        background: 'transparent',
                        color: '#f39c12',
                        border: '1px solid #f39c1244',
                        borderRadius: '6px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <HelpCircle size={12} />
                        Hint
                      </button>
                      <button onClick={validateChallenge} disabled={validating || !challengeQuery.trim()} style={{
                        background: '#0078d4',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 16px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: validating || !challengeQuery.trim() ? 'not-allowed' : 'pointer',
                        opacity: validating || !challengeQuery.trim() ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <Play size={12} />
                        {validating ? 'Checking...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={challengeQuery}
                    onChange={e => setChallengeQuery(e.target.value)}
                    placeholder="// Write your KQL query here..."
                    style={{
                      width: '100%',
                      height: '200px',
                      background: '#0f0f1a',
                      color: '#00ff88',
                      border: 'none',
                      padding: '16px',
                      fontSize: '13px',
                      fontFamily: 'Consolas, Monaco, monospace',
                      resize: 'vertical',
                      outline: 'none',
                      lineHeight: '1.6',
                    }}
                  />
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}