import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function LessonsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const payload = await verifyToken(token!)

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  })

  const lessons = await prisma.lesson.findMany({
    where: {
      difficultyLevel: {
        gte: user?.difficultyScore ?? 1,
        lte: (user?.difficultyScore ?? 1) + 1,
      },
    },
    include: { _count: { select: { questions: true } } },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-green-600">LangGo</Link>
        <span className="text-gray-500 text-sm">Level {user?.difficultyScore}</span>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your lessons</h2>
        <p className="text-gray-500 mb-8">Lessons matched to your current level</p>

        {lessons.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-gray-500">No lessons available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lessons.map(lesson => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}`}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition block"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-800">{lesson.title}</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Level {lesson.difficultyLevel}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{lesson.category}</p>
                <p className="text-xs text-gray-400">{lesson._count.questions} questions</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}