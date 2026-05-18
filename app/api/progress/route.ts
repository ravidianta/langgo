import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const schema = z.object({
  subLevelId: z.string().uuid(),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
})

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    const body = await request.json()
    const { subLevelId, score, passed } = schema.parse(body)

    const existing = await prisma.progress.findFirst({
      where: { userId: payload.userId, subLevelId },
    })

    if (existing) {
      if (score > existing.score) {
        await prisma.progress.update({
          where: { id: existing.id },
          data: { score, passed, completedAt: new Date() },
        })
      }
    } else {
      await prisma.progress.create({
        data: { userId: payload.userId, subLevelId, score, passed },
      })
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    const newLevel = Math.floor((user?.xp ?? 0) / 100) + 1
    await prisma.user.update({
      where: { id: payload.userId },
      data: { level: newLevel },
    })

    return NextResponse.json({ message: 'Progress saved', passed })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Progress error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}