'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CHARACTERS = [
  { id: 'momo', name: 'Momo', emoji: '🐒', role: 'The Wild Card', description: 'Unpredictable & chaotic!', bg: '#fef9c3', border: '#fde047', abilities: ['🎲 Random 1x–3x XP per question', '💛 Starts with 7 hearts'], luck: 100, hearts: 85, voice: 60 },
  { id: 'nadia', name: 'Nadia', emoji: '👩‍🏫', role: 'The Linguist', description: 'Voice & pronunciation master.', bg: '#dbeafe', border: '#93c5fd', abilities: ['🎙️ Voice answers score 20% easier', '👂 AI speaks slower for you'], luck: 30, hearts: 60, voice: 100 },
  { id: 'kai', name: 'Kai', emoji: '🥷', role: 'The Speedrunner', description: 'Built for the Respawn Zone.', bg: '#fee2e2', border: '#fca5a5', abilities: ['⚡ Respawn timer 25s not 15s', '🔄 2 free Respawn attempts/day'], luck: 50, hearts: 40, voice: 55 },
  { id: 'raka', name: 'Raka', emoji: '🧙‍♂️', role: 'The Scholar', description: 'XP and streak focused grinder.', bg: '#f3e8ff', border: '#d8b4fe', abilities: ['📚 +25% XP on correct answers', '🔥 One wrong never breaks streak'], luck: 40, hearts: 70, voice: 45 },
  { id: 'dinda', name: 'Dinda', emoji: '🛡️', role: 'The Tank', description: 'Built to survive boss fights.', bg: '#dcfce7', border: '#86efac', abilities: ['💚 No heart loss in boss fights', '❤️ Starts with 8 hearts'], luck: 40, hearts: 100, voice: 50 },
]

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: 5, background: '#f3f4f6', borderRadius: 3, flex: 1 }}>
      <div style={{ height: '100%', width: value + '%', background: color, borderRadius: 3 }} />
    </div>
  )
}

export default function CharacterSelectPage() {
  const router = useRouter()
  const [selected, setSelected] = useState('momo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const char = CHARACTERS.find(c => c.id === selected)!

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/user/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character: selected }),
      })
      if (!res.ok) {
        setError('Failed to save. Try again.')
        setLoading(false)
        return
      }
      router.push('/learn')
    } catch {
      setError('Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🐒</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#16a34a', margin: 0 }}>Choose your character</h1>
        <p style={{ color: '#6b7280', marginTop: 6 }}>Your companion through every lesson and boss fight</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, width: '100%', maxWidth: 700, marginBottom: 24 }}>
        {CHARACTERS.map(c => (
          <div
            key={c.id}
            onClick={() => setSelected(c.id)}
            style={{
              background: selected === c.id ? c.bg : '#fff',
              border: `2px solid ${selected === c.id ? c.border : '#e5e7eb'}`,
              borderRadius: 16,
              padding: 14,
              cursor: 'pointer',
              transform: selected === c.id ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: c.bg, border: `2px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                {c.emoji}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#111827' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{c.role}</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{c.description}</p>
            {c.abilities.map((a, i) => (
              <div key={i} style={{ fontSize: 11, background: '#fff', borderRadius: 8, padding: '4px 8px', border: '1px solid #f3f4f6', marginBottom: 4 }}>{a}</div>
            ))}
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: '#9ca3af', width: 36 }}>Luck</span>
                <Bar value={c.luck} color="#f59e0b" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: '#9ca3af', width: 36 }}>Hearts</span>
                <Bar value={c.hearts} color="#ef4444" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: '#9ca3af', width: 36 }}>Voice</span>
                <Bar value={c.voice} color="#3b82f6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 14 }}>{error}</div>}

      <button
        onClick={handleConfirm}
        disabled={loading}
        style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 16, padding: '14px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Saving...' : `Start with ${char.name} ${char.emoji}`}
      </button>
    </div>
  )
}