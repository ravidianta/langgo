import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)

    // Get 5 random questions from completed sublevels
    const completedProgress = await prisma.progress.findMany({
      where: { userId: payload.userId, passed: true },
      include: { subLevel: { include: { questions: true } } },
    })

    let allQuestions = completedProgress.flatMap(p =>
      p.subLevel.questions.filter(q => q.type === 'MULTIPLE_CHOICE' && q.options.length > 0)
    )

    // If not enough completed questions, get any multiple choice questions
    if (allQuestions.length < 5) {
      const anyQuestions = await prisma.question.findMany({
        where: { type: 'MULTIPLE_CHOICE' },
        take: 20,
      })
      allQuestions = [...allQuestions, ...anyQuestions]
    }

    // Shuffle and take 5
    const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, 5)

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    return NextResponse.json({ questions: shuffled, user })
  } catch (error) {
    console.error('Respawn GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    const body = await request.json()
    const { correctCount } = body

    const passed = correctCount >= 3

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (passed) {
      await prisma.user.update({
        where: { id: payload.userId },
        data: { hearts: user?.maxHearts ?? 5 },
      })
    }

    return NextResponse.json({ passed, heartsRestored: passed ? user?.maxHearts ?? 5 : 0 })
  } catch (error) {
    console.error('Respawn POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}