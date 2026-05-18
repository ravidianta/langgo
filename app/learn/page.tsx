'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type SubLevel = {
  id: string
  number: string
  label: string
  isBoss: boolean
  isUnitBoss: boolean
  isVoiceOnly: boolean
  isUnlocked: boolean
  isPassed: boolean
  isActive: boolean
  order: number
}

type Topic = {
  id: string
  name: string
  emoji: string
  subLevels: SubLevel[]
  isUnlocked: boolean
}

type Unit = {
  id: string
  name: string
  flag: string
  theme: string
  order: number
  topics: Topic[]
  isUnlocked: boolean
}

type User = {
  character: string
  hearts: number
  maxHearts: number
  xp: number
  level: number
  streakDays: number
}

const unitThemes: Record<string, {
  bg: string
  titleColor: string
  subColor: string
  connDone: string
  connLocked: string
  nodeDone: string
  nodeActive: string
  scenery: string[]
}> = {
  uk: {
    bg: 'linear-gradient(180deg, #bfdbfe 0%, #dbeafe 60%, #e0f2fe 100%)',
    titleColor: '#1e3a8a',
    subColor: '#3b82f6',
    connDone: '#3b82f6',
    connLocked: '#d1d5db',
    nodeDone: '#1d4ed8',
    nodeActive: '#3b82f6',
    scenery: ['🏰', '🌧️', '☎️', '🚂'],
  },
  usa: {
    bg: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 40%, #fed7aa 100%)',
    titleColor: '#92400e',
    subColor: '#b45309',
    connDone: '#d97706',
    connLocked: '#d1d5db',
    nodeDone: '#b45309',
    nodeActive: '#d97706',
    scenery: ['🗽', '🚗', '🍔', '🏈'],
  },
}

const characterEmoji: Record<string, string> = {
  momo: '🐒', nadia: '👩‍🏫', kai: '🥷', raka: '🧙‍♂️', dinda: '🛡️'
}

const characterMoods: Record<number, string> = {
  5: 'Ready to learn! 🎉',
  4: 'Let\'s keep going! 💪',
  3: 'Stay focused! 😤',
  2: 'Be careful! 😰',
  1: 'Last heart! 😱',
  0: 'No hearts! Enter Respawn Zone! 💀',
}

export default function LearnPage() {
  const router = useRouter()
  const [units, setUnits] = useState<Unit[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  function loadData() {
    fetch('/api/learn')
      .then(r => r.json())
      .then(data => {
        setUnits(data.units ?? [])
        setUser(data.user ?? null)
        setLoading(false)
      })
  }

  loadData()
  const interval = setInterval(loadData, 5000)
  return () => clearInterval(interval)
}, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🐒</div>
          <p className="text-gray-500">Loading your world...</p>
        </div>
      </div>
    )
  }

  const hearts = Array.from({ length: user?.maxHearts ?? 5 }, (_, i) => i < (user?.hearts ?? 5))
  const mood = characterMoods[Math.min(user?.hearts ?? 5, 5)] ?? characterMoods[5]
  const emoji = characterEmoji[user?.character ?? 'momo']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <Link href="/dashboard" className="text-xl font-bold text-green-600">LangGo</Link>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-amber-600">🔥 {user?.streakDays}d</span>
          <span className="text-sm font-medium text-purple-600">⭐ {user?.xp} XP</span>
          <div className="flex gap-0.5">
            {hearts.map((full, i) => (
              <span key={i} className="text-base" style={{ filter: full ? 'none' : 'grayscale(1) opacity(0.3)' }}>❤️</span>
            ))}
          </div>
        </div>
      </nav>

      {/* Character status bar */}
      <div className="bg-white border-b px-4 py-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
          style={{ background: '#f0fdf4', border: '2px solid #86efac' }}>
          {emoji}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-700">{mood}</div>
          <div className="text-xs text-gray-400">Level {user?.level}</div>
        </div>
        {(user?.hearts ?? 5) === 0 && (
          <Link href="/respawn"
            className="ml-auto bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold animate-pulse">
            ⚡ Respawn Zone
          </Link>
        )}
      </div>

      {/* Units */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {units.map(unit => {
          const theme = unitThemes[unit.theme] ?? unitThemes.uk
          return (
            <div key={unit.id} className="rounded-2xl overflow-hidden shadow-sm"
              style={{ background: unit.isUnlocked ? theme.bg : 'linear-gradient(180deg,#f3f4f6,#e5e7eb)', opacity: unit.isUnlocked ? 1 : 0.6 }}>
              <div className="p-4">
                {/* Unit header */}
                <div className="text-center mb-4">
                  <div className="text-3xl mb-1">{unit.flag}</div>
                  <div className="text-sm font-bold uppercase tracking-widest" style={{ color: theme.titleColor }}>
                    Unit {unit.order} — {unit.name}
                  </div>
                  {!unit.isUnlocked && (
                    <div className="text-xs text-gray-500 mt-1">🔒 Complete previous unit to unlock</div>
                  )}
                </div>

                {/* Topics */}
                <div className="space-y-4">
                  {unit.topics.map(topic => (
                    <div key={topic.id} className="bg-white bg-opacity-60 rounded-xl p-3">
                      <div className="text-xs font-bold text-gray-600 mb-3 flex items-center gap-1">
                        <span>{topic.emoji}</span> {topic.name}
                        {!topic.isUnlocked && <span className="ml-auto text-gray-400">🔒</span>}
                      </div>

                      {/* SubLevel path */}
                      <div className="flex items-center justify-center gap-0 flex-wrap">
                        {topic.subLevels.map((sl, idx) => (
                          <div key={sl.id} className="flex items-center">
                            {/* Node */}
                            <div className="flex flex-col items-center">
                              <button
                                disabled={!sl.isUnlocked}
                                onClick={() => sl.isUnlocked && router.push(`/learn/${sl.id}`)}
                                className="relative flex flex-col items-center"
                              >
                                <div
                                  className="flex items-center justify-center rounded-full border-2 transition-all"
                                  style={{
                                    width: sl.isBoss ? 56 : 48,
                                    height: sl.isBoss ? 56 : 48,
                                    fontSize: sl.isBoss ? 22 : 18,
                                    background: sl.isPassed ? theme.nodeDone :
                                      sl.isActive ? '#fff' :
                                      '#e5e7eb',
                                    borderColor: sl.isPassed ? theme.nodeDone :
                                      sl.isActive ? theme.nodeActive :
                                      '#d1d5db',
                                    boxShadow: sl.isActive ? `0 0 0 4px ${theme.nodeActive}33` : 'none',
                                    color: sl.isPassed ? '#fff' : sl.isActive ? theme.nodeActive : '#9ca3af',
                                  }}
                                >
                                  {/* Character on active node */}
                                  {sl.isActive && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                      <div className="text-lg">{emoji}</div>
                                    </div>
                                  )}
                                  {sl.isPassed ? '✓' :
                                    sl.isBoss ? '👑' :
                                    sl.isUnlocked ? '★' : '🔒'}
                                </div>
                                <div className="text-xs mt-1 font-medium text-center"
                                  style={{ color: sl.isPassed ? theme.nodeDone : sl.isActive ? theme.nodeActive : '#9ca3af', maxWidth: 52 }}>
                                  {sl.isBoss ? 'Boss' : sl.number}
                                </div>
                              </button>
                            </div>

                            {/* Connector */}
                            {idx < topic.subLevels.length - 1 && (
                              <div className="w-6 h-0.5 mx-0.5"
                                style={{ background: sl.isPassed ? theme.connDone : theme.connLocked }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}