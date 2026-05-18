'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Question = {
  id: string
  prompt: string
  correctAnswer: string
  options: string[]
}

const TOTAL_TIME = 15
const TOTAL_QUESTIONS = 5
const PASS_THRESHOLD = 3

export default function RespawnPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState<{ passed: boolean; heartsRestored: number } | null>(null)
  const [answered, setAnswered] = useState(false)

  useEffect(() => {
    fetch('/api/respawn')
      .then(r => r.json())
      .then(data => {
        setQuestions(data.questions ?? [])
        setLoading(false)
      })
  }, [])

  const finishRespawn = useCallback(async (correct: number) => {
    setFinished(true)
    const res = await fetch('/api/respawn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correctCount: correct }),
    })
    const data = await res.json()
    setResult(data)
  }, [])

  useEffect(() => {
    if (loading || finished) return
    if (timeLeft <= 0) {
      finishRespawn(correctCount)
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, loading, finished, correctCount, finishRespawn])

  function handleAnswer(answer: string) {
    if (answered || finished) return
    setAnswered(true)
    setSelected(answer)
    const isCorrect = answer.trim().toLowerCase() === questions[currentQ].correctAnswer.trim().toLowerCase()
    const newCorrect = isCorrect ? correctCount + 1 : correctCount
    if (isCorrect) setCorrectCount(newCorrect)
    setTimeout(() => {
      if (currentQ + 1 >= TOTAL_QUESTIONS) {
        finishRespawn(newCorrect)
      } else {
        setCurrentQ(q => q + 1)
        setSelected(null)
        setAnswered(false)
      }
    }, 600)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1c0505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#ef4444' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💀</div>
          <p>Entering the Respawn Zone...</p>
        </div>
      </div>
    )
  }

  if (finished && result) {
    return (
      <div style={{ minHeight: '100vh', background: result.passed ? '#0f172a' : '#1c0505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ background: result.passed ? '#14532d' : '#450a0a', borderRadius: 24, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center', border: `2px solid ${result.passed ? '#16a34a' : '#dc2626'}` }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{result.passed ? '🎉' : '💀'}</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: result.passed ? '#4ade80' : '#ef4444', marginBottom: 8 }}>
            {result.passed ? 'You escaped!' : 'Eliminated!'}
          </h2>
          <p style={{ color: result.passed ? '#86efac' : '#fca5a5', marginBottom: 24 }}>
            {correctCount}/{TOTAL_QUESTIONS} correct —{' '}
            {result.passed ? `All ${result.heartsRestored} hearts restored!` : 'Not enough to escape'}
          </p>
          {result.passed ? (
            <button
              onClick={() => router.push('/learn')}
              style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              Continue learning →
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => {
                  setFinished(false)
                  setCurrentQ(0)
                  setCorrectCount(0)
                  setTimeLeft(TOTAL_TIME)
                  setSelected(null)
                  setAnswered(false)
                  setResult(null)
                  setLoading(true)
                  fetch('/api/respawn')
                    .then(r => r.json())
                    .then(data => { setQuestions(data.questions ?? []); setLoading(false) })
                }}
                style={{ width: '100%', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
              >
                ⚡ Try again
              </button>
              <button
                onClick={() => router.push('/learn')}
                style={{ width: '100%', background: '#374151', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
              >
                Wait for hearts ⏳
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const q = questions[currentQ]
  const timerPct = (timeLeft / TOTAL_TIME) * 100
  const timerColor = timeLeft > 10 ? '#ef4444' : timeLeft > 5 ? '#f97316' : '#7f1d1d'

  return (
    <div style={{ minHeight: '100vh', background: '#1c0505', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#450a0a', padding: '16px 20px', borderBottom: '2px solid #7f1d1d' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 16 }}>💀 Respawn Zone</div>
            <div style={{ color: '#fca5a5', fontSize: 13 }}>{correctCount}/{PASS_THRESHOLD} needed · Q{currentQ + 1}/{TOTAL_QUESTIONS}</div>
          </div>
          <div style={{ background: '#7f1d1d', borderRadius: 8, height: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${timerPct}%`, background: timerColor, borderRadius: 8, transition: 'width 1s linear, background 0.3s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: '#f87171' }}>Answer fast!</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: 480, margin: '0 auto', width: '100%', padding: '32px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#450a0a', border: '2px solid #dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
            💀
          </div>
          <div style={{ background: '#450a0a', borderRadius: 16, borderTopLeftRadius: 4, padding: '10px 16px', border: '1px solid #7f1d1d' }}>
            <p style={{ color: '#fca5a5', fontSize: 14, margin: 0 }}>{q?.prompt}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q?.options.map(opt => {
            let bg = '#2d0a0a'
            let border = '#7f1d1d'
            let color = '#fca5a5'
            if (selected) {
              if (opt === q.correctAnswer) { bg = '#14532d'; border = '#16a34a'; color = '#4ade80' }
              else if (opt === selected) { bg = '#450a0a'; border = '#dc2626'; color = '#ef4444' }
            }
            return (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={!!selected}
                style={{ background: bg, border: `2px solid ${border}`, borderRadius: 14, padding: '14px 18px', color, fontSize: 14, fontWeight: 600, cursor: selected ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
              >
                {opt}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
          {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < currentQ ? '#16a34a' : i === currentQ ? '#ef4444' : '#450a0a', border: '1px solid #7f1d1d' }} />
          ))}
        </div>
      </div>
    </div>
  )
}