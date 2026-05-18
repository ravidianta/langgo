'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Question = {
  id: string
  prompt: string
  correctAnswer: string
  type: string
  options: string[]
}

type SubLevel = {
  id: string
  number: string
  label: string
  isBoss: boolean
  isUnitBoss: boolean
  order: number
  questions: Question[]
}

type Topic = {
  id: string
  name: string
  emoji: string
  subLevels: SubLevel[]
}

type Unit = {
  id: string
  name: string
  flag: string
  topics: Topic[]
}

export default function AdminPage() {
  const router = useRouter()
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    number: '',
    label: '',
    isBoss: false,
    isUnitBoss: false,
    isVoiceOnly: false,
    order: 1,
    questions: [{ prompt: '', correctAnswer: '', type: 'MULTIPLE_CHOICE', isVoice: false, options: ['', '', '', ''] }],
  })

  useEffect(() => {
    fetch('/api/admin/lessons')
      .then(r => {
        if (r.status === 403) { router.push('/dashboard'); return null }
        return r.json()
      })
      .then(data => {
        if (!data) return
        setUnits(data.units ?? [])
        setLoading(false)
      })
      .catch(() => { setError('Failed to load'); setLoading(false) })
  }, [router])

  async function handleSubmit() {
    if (!selectedTopic) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: selectedTopic.id,
          subLevel: {
            ...form,
            questions: form.questions.map(q => ({
              ...q,
              options: q.type === 'MULTIPLE_CHOICE' ? q.options.filter(o => o.trim()) : [],
            })),
          },
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(JSON.stringify(data.error))
        return
      }

      setSuccess('SubLevel created successfully!')
      setShowForm(false)

      // Reload
      fetch('/api/admin/lessons')
        .then(r => r.json())
        .then(data => setUnits(data.units ?? []))
    } catch {
      setError('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(subLevelId: string) {
    if (!confirm('Delete this sublevel and all its questions?')) return
    await fetch(`/api/admin/lessons?subLevelId=${subLevelId}`, { method: 'DELETE' })
    fetch('/api/admin/lessons')
      .then(r => r.json())
      .then(data => setUnits(data.units ?? []))
  }

  function addQuestion() {
    setForm(f => ({
      ...f,
      questions: [...f.questions, { prompt: '', correctAnswer: '', type: 'MULTIPLE_CHOICE', isVoice: false, options: ['', '', '', ''] }],
    }))
  }

  function updateQuestion(index: number, field: string, value: string | boolean) {
    setForm(f => ({
      ...f,
      questions: f.questions.map((q, i) => i === index ? { ...q, [field]: value } : q),
    }))
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setForm(f => ({
      ...f,
      questions: f.questions.map((q, i) => i === qIndex
        ? { ...q, options: q.options.map((o, j) => j === oIndex ? value : o) }
        : q
      ),
    }))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 48 }}>⏳</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: 24 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Admin Panel</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Manage lessons and content</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', color: '#374151', fontWeight: 600 }}
          >
            ← Back
          </button>
        </div>

        {success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 12, marginBottom: 16, color: '#15803d' }}>
            ✓ {success}
          </div>
        )}

        {error && (
          <div style={{ background: '#fff1f2', border: '1px solid #fca5a5', borderRadius: 10, padding: 12, marginBottom: 16, color: '#dc2626' }}>
            {error}
          </div>
        )}

        {/* Units and Topics */}
        {units.map(unit => (
          <div key={unit.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>{unit.flag}</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{unit.name}</span>
            </div>

            {unit.topics.map(topic => (
              <div key={topic.id} style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, color: '#374151' }}>
                    {topic.emoji} {topic.name}
                    <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>{topic.subLevels.length} sublevels</span>
                  </div>
                  <button
                    onClick={() => { setSelectedTopic(topic); setShowForm(true); setSuccess('') }}
                    style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    + Add SubLevel
                  </button>
                </div>

                {/* SubLevels list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {topic.subLevels.map(sl => (
                    <div key={sl.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: sl.isBoss ? '#fef9c3' : '#f9fafb', borderRadius: 8, padding: '8px 12px', border: `1px solid ${sl.isBoss ? '#fde047' : '#e5e7eb'}` }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>
                          {sl.isBoss ? '👑' : '📖'} {sl.number} — {sl.label}
                        </span>
                        <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>
                          {sl.questions.length} questions
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(sl.id)}
                        style={{ background: '#fff1f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Add SubLevel Form */}
        {showForm && selectedTopic && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24, overflowY: 'auto', zIndex: 100 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 600, marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                  Add SubLevel to {selectedTopic.emoji} {selectedTopic.name}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>✕</button>
              </div>

              {/* SubLevel fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Number (e.g. 1.4)</label>
                  <input value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Order</label>
                  <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) }))}
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Label</label>
                <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isBoss} onChange={e => setForm(f => ({ ...f, isBoss: e.target.checked }))} />
                  Is Boss
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isUnitBoss} onChange={e => setForm(f => ({ ...f, isUnitBoss: e.target.checked }))} />
                  Is Unit Boss
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isVoiceOnly} onChange={e => setForm(f => ({ ...f, isVoiceOnly: e.target.checked }))} />
                  Voice Only
                </label>
              </div>

              {/* Questions */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Questions</h3>
                  <button onClick={addQuestion}
                    style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    + Add Question
                  </button>
                </div>

                {form.questions.map((q, qi) => (
                  <div key={qi} style={{ background: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 12, border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Question {qi + 1}</div>

                    <div style={{ marginBottom: 8 }}>
                      <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 3 }}>Type</label>
                      <select value={q.type} onChange={e => updateQuestion(qi, 'type', e.target.value)}
                        style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 10px', fontSize: 13, background: '#fff' }}>
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        <option value="TRANSLATION">Translation</option>
                        <option value="FREE_TEXT">Free Text</option>
                        <option value="VOICE">Voice</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 3 }}>Prompt</label>
                      <input value={q.prompt} onChange={e => updateQuestion(qi, 'prompt', e.target.value)}
                        style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 10px', fontSize: 13, boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 3 }}>Correct Answer</label>
                      <input value={q.correctAnswer} onChange={e => updateQuestion(qi, 'correctAnswer', e.target.value)}
                        style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 10px', fontSize: 13, boxSizing: 'border-box' }} />
                    </div>

                    {q.type === 'MULTIPLE_CHOICE' && (
                      <div>
                        <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 4 }}>Options (4 choices)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          {q.options.map((opt, oi) => (
                            <input key={oi} value={opt} onChange={e => updateOption(qi, oi, e.target.value)}
                              placeholder={`Option ${oi + 1}`}
                              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 10px', fontSize: 12, boxSizing: 'border-box' }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={() => setShowForm(false)}
                  style={{ flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, padding: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  style={{ flex: 2, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? 'Creating...' : 'Create SubLevel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}