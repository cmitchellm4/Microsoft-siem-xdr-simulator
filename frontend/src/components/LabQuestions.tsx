import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, HelpCircle, ChevronRight, Trophy } from 'lucide-react'

interface Question {
  id: string
  question: string
  hint: string
  points: number
}

interface Props {
  scenarioId: string
  scenarioName: string
}

export default function LabQuestions({ scenarioId, scenarioName }: Props) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/labs/scenarios/${scenarioId}/questions`)
        const data = await res.json()
        setQuestions(data.questions)
        setTotalPoints(data.total_points)
      } catch {
        setQuestions([])
      }
    }
    fetchQuestions()
  }, [scenarioId])

  const currentQuestion = questions[currentIndex]
  const isComplete = Object.keys(answeredQuestions).length === questions.length && questions.length > 0
  const allAnswered = (qId: string) => answeredQuestions[qId]

  const handleSubmit = async () => {
    if (!answer.trim() || !currentQuestion) return
    setLoading(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/labs/scenarios/${scenarioId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: currentQuestion.id, answer }),
      })
      const data = await res.json()
      setResult(data)
      setAnsweredQuestions(prev => ({ ...prev, [currentQuestion.id]: data }))
      if (data.correct) {
        setScore(prev => prev + data.points_awarded)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    setResult(null)
    setAnswer('')
    setShowHint(false)
    setCurrentIndex(prev => prev + 1)
  }

  if (questions.length === 0) return null

  return (
    <div style={{
      background: '#1a1a2e',
      border: '1px solid #2a2a4a',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '16px',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
          Lab Questions — {scenarioName}
        </h3>
        <div style={{ fontSize: '12px', color: '#8888aa' }}>
          Score: <span style={{ color: '#f39c12', fontWeight: 700 }}>{score}</span> / {totalPoints} pts
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {questions.map((q, i) => {
          const answered = answeredQuestions[q.id]
          return (
            <div key={q.id} style={{
              width: '28px',
              height: '6px',
              borderRadius: '3px',
              background: answered
                ? answered.correct ? '#27ae60' : '#e74c3c'
                : i === currentIndex ? '#0078d4' : '#2a2a4a',
            }} />
          )
        })}
      </div>

      {/* Complete state */}
      {isComplete ? (
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <Trophy size={48} color='#f39c12' style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
            Lab Complete!
          </h3>
          <p style={{ color: '#8888aa', fontSize: '13px', marginBottom: '16px' }}>
            You scored {score} out of {totalPoints} points
          </p>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: score >= totalPoints * 0.8 ? '#27ae60' : score >= totalPoints * 0.5 ? '#f39c12' : '#e74c3c',
          }}>
            {Math.round((score / totalPoints) * 100)}%
          </div>
          <p style={{ color: '#8888aa', fontSize: '12px', marginTop: '8px' }}>
            {score >= totalPoints * 0.8
              ? 'Excellent work! You have a strong grasp of this attack scenario.'
              : score >= totalPoints * 0.5
              ? 'Good effort! Review the alerts and incidents to strengthen your knowledge.'
              : 'Keep practicing! Re-run the scenario and investigate the alerts more carefully.'}
          </p>
        </div>
      ) : currentQuestion ? (
        <div>
          {/* Question */}
          <div style={{
            background: '#0f0f1a',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '12px',
            border: '1px solid #2a2a4a',
          }}>
            <div style={{ fontSize: '11px', color: '#8888aa', marginBottom: '8px' }}>
              Question {currentIndex + 1} of {questions.length} • {currentQuestion.points} points
            </div>
            <div style={{ fontSize: '14px', color: '#ffffff', lineHeight: '1.5' }}>
              {currentQuestion.question}
            </div>
          </div>

          {/* Hint */}
          {showHint && (
            <div style={{
              background: '#f39c1222',
              border: '1px solid #f39c1244',
              borderRadius: '6px',
              padding: '10px 14px',
              marginBottom: '12px',
              fontSize: '12px',
              color: '#f39c12',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}>
              <HelpCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
              {currentQuestion.hint}
            </div>
          )}

          {/* Result */}
          {result && (
            <div style={{
              background: result.correct ? '#27ae6022' : '#e74c3c22',
              border: `1px solid ${result.correct ? '#27ae6044' : '#e74c3c44'}`,
              borderRadius: '6px',
              padding: '10px 14px',
              marginBottom: '12px',
              fontSize: '12px',
              color: result.correct ? '#27ae60' : '#e74c3c',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              {result.correct
                ? <CheckCircle size={14} />
                : <XCircle size={14} />
              }
              {result.feedback}
            </div>
          )}

          {/* Input */}
          {!result && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Type your answer..."
                style={{
                  flex: 1,
                  background: '#0f0f1a',
                  border: '1px solid #2a2a4a',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !answer.trim()}
                style={{
                  background: '#0078d4',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: loading || !answer.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !answer.trim() ? 0.5 : 1,
                }}>
                Submit
              </button>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => setShowHint(!showHint)}
              style={{
                background: 'transparent',
                color: '#f39c12',
                border: '1px solid #f39c1244',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
              <HelpCircle size={12} />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>

            {result && currentIndex < questions.length - 1 && (
              <button
                onClick={handleNext}
                style={{
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
                Next Question
                <ChevronRight size={12} />
              </button>
            )}

            {result && currentIndex === questions.length - 1 && (
              <button
                onClick={handleNext}
                style={{
                  background: '#27ae60',
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
                Finish Lab
                <Trophy size={12} />
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}