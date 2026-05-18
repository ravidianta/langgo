'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Question = {
  id: string
  prompt: string
  correctAnswer: string
  type: string
  isVoice: boolean
  options: string[]
}

type SubLevel = {
  id: string
  number: string
  label: string
  isBoss: boolean
  isUnitBoss: boolean
  isVoiceOnly: boolean
  questions: Question[]
  topic: { name: string; emoji: string; unit: { name: string; flag: string; theme: string } }
}

type User = {
  character: string
  hearts: number
  maxHearts: number
  xp: number
}

const characterEmoji: Record<string, string> = {
  momo: '🐒', nadia: '👩‍🏫', kai: '🥷', raka: '🧙‍♂️', dinda: '🛡️'
}

const unitThemes: Record<string, { bg: string; accent: string }> = {
  uk: { bg: '#dbeafe', accent: '#1d4ed8' },
  usa: { bg: '#fef3c7', accent: '#b45309' },
}

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [subLevel, setSubLevel] = useState<SubLevel | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string; suggestion: string } | null>(null)
  const [hearts, setHearts] = useState(5)
  const [xpGained, setXpGained] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    fetch(`/api/learn/sublevel/${id}`)
      .then(r => r.json())
      .then(data => {
        setSubLevel(data.subLevel)
        setUser(data.user)
        setHearts(data.user?.hearts ?? 5)
        setLoading(false)
      })
  }, [id])

  async function submitAnswer(answer: string) {
    if (!subLevel || submitting) return
    setSubmitting(true)

    const q = subLevel.questions[currentQ]

    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: q.id, userAnswer: answer }),
    })

    const data = await res.json()
    setFeedback({ correct: data.correct, explanation: data.explanation, suggestion: data.suggestion })

    if (data.correct) {
      setCorrectCount(c => c + 1)
      setXpGained(x => x + 10)
    } else {
      const newHearts = Math.max(0, hearts - 1)
      setHearts(newHearts)
      if (newHearts === 0) {
        setTimeout(() => router.push('/respawn'), 1500)
      }
    }

    setSubmitting(false)
  }

  async function saveProgress(passed: boolean, score: number) {
  if (!id) return
  await fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subLevelId: id, score, passed }),
  })
}

  function nextQuestion() {
    if (currentQ + 1 >= (subLevel?.questions.length ?? 0)) {
      const score = Math.round((correctCount / subLevel!.questions.length) * 100)
      const passed = subLevel?.isBoss ? score >= 70 : score >= 50
      saveProgress(passed, score)
      setFinished(true)
    } else {
      setCurrentQ(q => q + 1)
      setSelected(null)
      setTextAnswer('')
      setFeedback(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-5xl animate-bounce">🐒</div>
      </div>
    )
  }

  if (!subLevel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Lesson not found.</p>
      </div>
    )
  }

  const theme = unitThemes[subLevel.topic.unit.theme] ?? unitThemes.uk
  const q = subLevel.questions[currentQ]
  const progress = ((currentQ) / subLevel.questions.length) * 100
  const emoji = characterEmoji[user?.character ?? 'momo']
  const heartsDisplay = Array.from({ length: user?.maxHearts ?? 5 }, (_, i) => i < hearts)

  // Finished screen
  if (finished) {
    const score = Math.round((correctCount / subLevel.questions.length) * 100)
    const passed = subLevel.isBoss ? score >= 70 : score >= 50

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">{passed ? '🎉' : '😢'}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {passed ? 'Lesson complete!' : 'Not quite...'}
          </h2>
          <p className="text-gray-500 mb-6">
            {score}% correct — {correctCount}/{subLevel.questions.length} questions
          </p>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <div className="text-2xl font-bold text-green-600">+{xpGained} XP</div>
            <div className="text-sm text-gray-500">earned this lesson</div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/learn')}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Back to path
            </button>
            {!passed && (
              <button
                onClick={() => {
                  setCurrentQ(0)
                  setSelected(null)
                  setTextAnswer('')
                  setFeedback(null)
                  setFinished(false)
                  setCorrectCount(0)
                  setXpGained(0)
                }}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Try again
              </button>
            )}
            {passed && (
              <button
                onClick={() => router.push('/learn')}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Continue →
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/learn')} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          {/* Progress bar */}
          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${progress}%` }} />
          </div>
          {/* Hearts */}
          <div className="flex gap-0.5">
            {heartsDisplay.map((full, i) => (
              <span key={i} className="text-sm" style={{ filter: full ? 'none' : 'grayscale(1) opacity(0.3)' }}>❤️</span>
            ))}
          </div>
        </div>
      </div>

      {/* Unit banner */}
      <div className="py-2 text-center text-sm font-medium"
        style={{ background: theme.bg, color: theme.accent }}>
        {subLevel.topic.unit.flag} {subLevel.topic.unit.name} · {subLevel.topic.emoji} {subLevel.topic.name} · {subLevel.label}
      </div>

      {/* Question */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        {/* Character */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: '#f0fdf4', border: '2px solid #86efac' }}>
            {emoji}
          </div>
          <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-700 font-medium">{q.prompt}</p>
          </div>
        </div>

        {/* Question counter */}
        <p className="text-xs text-gray-400 mb-4 text-center">
          Question {currentQ + 1} of {subLevel.questions.length}
        </p>

        {/* Answer options */}
        {q.type === 'MULTIPLE_CHOICE' && (
          <div className="grid grid-cols-1 gap-3 mb-6">
            {q.options.map(opt => (
              <button
                key={opt}
                disabled={!!feedback}
                onClick={() => {
                  if (feedback) return
                  setSelected(opt)
                  submitAnswer(opt)
                }}
                className="w-full text-left px-5 py-4 rounded-2xl border-2 font-medium transition-all"
                style={{
                  borderColor: !feedback ? (selected === opt ? '#16a34a' : '#e5e7eb') :
                    opt === q.correctAnswer ? '#16a34a' :
                    selected === opt ? '#dc2626' : '#e5e7eb',
                  background: !feedback ? '#fff' :
                    opt === q.correctAnswer ? '#f0fdf4' :
                    selected === opt ? '#fff1f2' : '#fff',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {(q.type === 'FREE_TEXT' || q.type === 'TRANSLATION') && (
          <div className="mb-6">
            <input
              type="text"
              value={textAnswer}
              onChange={e => setTextAnswer(e.target.value)}
              disabled={!!feedback}
              placeholder="Type your answer..."
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-gray-800 focus:outline-none focus:border-green-500"
              onKeyDown={e => {
                if (e.key === 'Enter' && textAnswer.trim() && !feedback) {
                  submitAnswer(textAnswer.trim())
                }
              }}
            />
            {!feedback && (
              <button
                onClick={() => submitAnswer(textAnswer.trim())}
                disabled={!textAnswer.trim() || submitting}
                className="w-full mt-3 bg-green-600 text-white py-3 rounded-2xl font-semibold disabled:opacity-50"
              >
                {submitting ? 'Checking...' : 'Check answer'}
              </button>
            )}
          </div>
        )}

        {q.type === 'VOICE' && (
          <div className="mb-6 text-center">
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-4">
              <p className="text-lg font-bold text-gray-800 mb-1">"{q.correctAnswer}"</p>
              <p className="text-sm text-gray-400">Say this phrase out loud</p>
            </div>
            <button
              disabled={!!feedback || submitting}
              onClick={() => submitAnswer(q.correctAnswer)}
              className="w-16 h-16 rounded-full bg-red-500 text-white text-2xl flex items-center justify-center mx-auto hover:bg-red-600 disabled:opacity-50 transition"
            >
              🎙️
            </button>
            <p className="text-xs text-gray-400 mt-2">Tap to record</p>
            <p className="text-xs text-gray-300 mt-1">(Voice AI coming soon — tap to continue for now)</p>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="rounded-2xl p-4 mb-4"
            style={{ background: feedback.correct ? '#f0fdf4' : '#fff1f2', border: `2px solid ${feedback.correct ? '#86efac' : '#fca5a5'}` }}>
            <div className="font-bold mb-1" style={{ color: feedback.correct ? '#15803d' : '#dc2626' }}>
              {feedback.correct ? '✓ Correct!' : '✗ Not quite'}
            </div>
            {feedback.explanation && (
              <p className="text-sm text-gray-600">{feedback.explanation}</p>
            )}
            {feedback.suggestion && (
              <p className="text-sm text-gray-500 mt-1">
                Correct answer: <span className="font-medium">{q.correctAnswer}</span>
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg">{emoji}</span>
              <span className="text-xs text-gray-500">
                {feedback.correct ? '+10 XP 🎉' : hearts === 0 ? 'No hearts left! Go to Respawn Zone!' : `${hearts} hearts remaining`}
              </span>
            </div>
          </div>
        )}

        {/* Next button */}
        {feedback && (
          <button
            onClick={nextQuestion}
            className="w-full py-4 rounded-2xl font-bold text-white transition"
            style={{ background: feedback.correct ? '#16a34a' : '#dc2626' }}
          >
            {currentQ + 1 >= subLevel.questions.length ? 'See results' : 'Next question →'}
          </button>
        )}
      </div>
    </div>
  )
}