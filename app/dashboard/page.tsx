import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const payload = await verifyToken(token!)

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      progress: {
        include: { subLevel: true },
        orderBy: { completedAt: 'desc' },
        take: 5,
      },
    },
  })

  const hearts = Array.from({ length: user?.maxHearts ?? 5 }, (_, i) => i < (user?.hearts ?? 5))

  const characterEmoji: Record<string, string> = {
    momo: '🐒', nadia: '👩‍🏫', kai: '🥷', raka: '🧙‍♂️', dinda: '🛡️'
  }

  const emoji = characterEmoji[user?.character ?? 'momo']

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-600">LangGo</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">{user?.email}</span>
          <form action="/api/auth/logout" method="POST">
            <button className="text-sm text-gray-500 hover:text-red-500 transition">
              Logout
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl"
            style={{ background: '#f0fdf4', border: '2px solid #86efac' }}>
            {emoji}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Welcome back!</h2>
            <p className="text-gray-500">
              {user?.character ? user.character.charAt(0).toUpperCase() + user.character.slice(1) : 'Momo'} · Level {user?.level} · {user?.xp} XP
            </p>
          </div>
          <div className="ml-auto flex gap-1">
            {hearts.map((full, i) => (
              <span key={i} className="text-xl" style={{ filter: full ? 'none' : 'grayscale(1) opacity(0.3)' }}>❤️</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-1">Lessons completed</h3>
            <p className="text-4xl font-bold text-green-600">{user?.progress.length ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-1">Total XP</h3>
            <p className="text-4xl font-bold text-green-600">{user?.xp ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-1">🔥 Streak</h3>
            <p className="text-4xl font-bold text-green-600">{user?.streakDays ?? 0} days</p>
          </div>
        </div>

        <div className="flex gap-4 mb-10">
          <Link
            href="/learn"
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Continue learning
          </Link>
        </div>

        {user?.progress && user.progress.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-4">Recent activity</h3>
            <ul className="space-y-3">
              {user.progress.map(p => (
                <li key={p.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{p.subLevel.label}</span>
                  <span className={`font-medium ${p.passed ? 'text-green-600' : 'text-red-500'}`}>
                    {p.score}% {p.passed ? '✓' : '✗'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}