import { useState } from 'react'
import { Terminal, Play } from 'lucide-react'

const exampleQueries = [
  { label: 'All sign-in events', query: 'SignInLogs\n| take 50' },
  { label: 'Failed sign-ins', query: 'SignInLogs\n| where Status == "Failure"\n| project TimeGenerated, UserPrincipalName, IPAddress\n| take 50' },
  { label: 'Process events', query: 'DeviceProcessEvents\n| take 50' },
  { label: 'Count alerts by severity', query: 'SecurityAlert\n| summarize Count = count() by AlertSeverity\n| order by Count desc' },
]

export default function KQLEditor() {
  const [query, setQuery] = useState('// Write your KQL query here\nSignInLogs\n| take 10')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    } catch (err) {
      setError('Could not connect to backend. Make sure the server is running.')
    } finally {
      setLoading(false)
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

      {/* Example Queries */}
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

      {/* Query Editor */}
      <div style={{
        background: '#1a1a2e',
        border: '1px solid #2a2a4a',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '12px',
      }}>
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid #2a2a4a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#8888aa' }}>
            <Terminal size={14} />
            KQL Query
          </div>
          <button
            onClick={runQuery}
            disabled={loading}
            style={{
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

      {/* Error */}
      {error && (
        <div style={{
          background: '#e74c3c22',
          border: '1px solid #e74c3c',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          color: '#e74c3c',
          marginBottom: '12px',
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: '8px',
          overflow: 'hidden',
          flex: 1,
        }}>
          <div style={{
            padding: '8px 16px',
            borderBottom: '1px solid #2a2a4a',
            fontSize: '12px',
            color: '#8888aa',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span>Results</span>
            <span>{results.row_count ?? 0} rows</span>
          </div>
          {results.error ? (
            <div style={{ padding: '16px', color: '#e74c3c', fontSize: '13px' }}>
              {results.error}
            </div>
          ) : results.rows?.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#8888aa', fontSize: '13px' }}>
              Query returned no results. Start a scenario to populate log data.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#0f0f1a' }}>
                    {results.columns?.map((col: string) => (
                      <th key={col} style={{
                        padding: '8px 16px',
                        textAlign: 'left',
                        color: '#8888aa',
                        fontWeight: 600,
                        borderBottom: '1px solid #2a2a4a',
                        whiteSpace: 'nowrap',
                      }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.rows?.map((row: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1a1a2e' }}>
                      {results.columns?.map((col: string) => (
                        <td key={col} style={{
                          padding: '8px 16px',
                          color: '#cccccc',
                          whiteSpace: 'nowrap',
                        }}>{String(row[col] ?? '')}</td>
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
  )
}