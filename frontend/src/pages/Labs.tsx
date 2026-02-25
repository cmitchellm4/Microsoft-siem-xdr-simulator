import { FlaskConical, Clock, Target } from 'lucide-react'

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
  return (
    <div style={{ padding: '32px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>Labs & Scenarios</h1>
        <p style={{ color: '#8888aa', marginTop: '6px', fontSize: '14px' }}>
          Launch attack scenarios and complete guided labs to build your skills.
        </p>
      </div>

      {/* Scenario Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {scenarios.map(scenario => (
          <div key={scenario.id} style={{
            background: '#1a1a2e',
            border: '1px solid #2a2a4a',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>

            {/* Title & Difficulty */}
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

            {/* Description */}
            <p style={{ fontSize: '12px', color: '#8888aa', lineHeight: '1.5' }}>
              {scenario.description}
            </p>

            {/* Tags */}
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

            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '4px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#8888aa' }}>
                <Clock size={12} />
                ~{scenario.minutes} min
              </div>
              <button style={{
                background: '#0078d4',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Target size={12} />
                Start Lab
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}