import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const questionSchema = z.object({
  prompt: z.string().min(1),
  correctAnswer: z.string().min(1),
  type: z.enum(['MULTIPLE_CHOICE', 'FREE_TEXT', 'TRANSLATION', 'VOICE']),
  isVoice: z.boolean().default(false),
  options: z.array(z.string()).default([]),
})

const subLevelSchema = z.object({
  number: z.string().min(1),
  label: z.string().min(1),
  isBoss: z.boolean().default(false),
  isUnitBoss: z.boolean().default(false),
  isVoiceOnly: z.boolean().default(false),
  order: z.number(),
  questions: z.array(questionSchema),
})

const createSchema = z.object({
  topicId: z.string().uuid(),
  subLevel: subLevelSchema,
})

async function checkAdmin(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (payload.role !== 'ADMIN') return null
  return payload
}

export async function GET(request: NextRequest) {
  try {
    const payload = await checkAdmin(request)
    if (!payload) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const units = await prisma.unit.findMany({
      orderBy: { order: 'asc' },
      include: {
        topics: {
          orderBy: { order: 'asc' },
          include: {
            subLevels: {
              orderBy: { order: 'asc' },
              include: { questions: true },
            },
          },
        },
      },
    })

    return NextResponse.json({ units })
  } catch (error) {
    console.error('Admin GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await checkAdmin(request)
    if (!payload) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { topicId, subLevel } = createSchema.parse(body)

    const created = await prisma.subLevel.create({
      data: {
        topicId,
        number: subLevel.number,
        label: subLevel.label,
        isBoss: subLevel.isBoss,
        isUnitBoss: subLevel.isUnitBoss,
        isVoiceOnly: subLevel.isVoiceOnly,
        order: subLevel.order,
        questions: {
          create: subLevel.questions.map(q => ({
            prompt: q.prompt,
            correctAnswer: q.correctAnswer,
            type: q.type,
            isVoice: q.isVoice,
            options: q.options,
          })),
        },
      },
    })

    return NextResponse.json({ message: 'SubLevel created', id: created.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Admin POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await checkAdmin(request)
    if (!payload) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const subLevelId = searchParams.get('subLevelId')

    if (!subLevelId) return NextResponse.json({ error: 'subLevelId required' }, { status: 400 })

    await prisma.question.deleteMany({ where: { subLevelId } })
    await prisma.subLevel.delete({ where: { id: subLevelId } })

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('Admin DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}