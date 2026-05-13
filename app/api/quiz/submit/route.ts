import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { getGrammarFeedback } from '@/lib/openai'

const submitSchema = z.object({
  questionId: z.string().uuid(),
  userAnswer: z.string().min(1).max(1000),
})

export const dynamic = 'force-dynamic'

const xpByCharacter: Record<string, number> = {
  momo: 10, nadia: 10, kai: 10, raka: 13, dinda: 10,
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    const body = await request.json()
    const { questionId, userAnswer } = submitSchema.parse(body)

    const sanitizedAnswer = userAnswer.replace(/<[^>]*>/g, '').trim()

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    let feedback = { isCorrect: false, explanation: '', suggestion: '' }

    if (question.type === 'FREE_TEXT' || question.type === 'TRANSLATION') {
      const aiFeedback = await getGrammarFeedback(
        question.prompt,
        question.correctAnswer,
        sanitizedAnswer
      )
      feedback = aiFeedback
    } else if (question.type === 'VOICE') {
      feedback = {
        isCorrect: true,
        explanation: 'Voice answer accepted!',
        suggestion: '',
      }
    } else {
      feedback = {
        isCorrect: sanitizedAnswer.toLowerCase() === question.correctAnswer.toLowerCase(),
        explanation: '',
        suggestion: '',
      }
    }

    await prisma.quizAttempt.create({
      data: {
        userId: payload.userId,
        questionId,
        userAnswer: sanitizedAnswer,
        isCorrect: feedback.isCorrect,
        aiFeedback: feedback.explanation,
      },
    })

    // Update hearts if wrong
    let newHearts = user?.hearts ?? 5
    if (!feedback.isCorrect && user?.character !== 'dinda') {
      newHearts = Math.max(0, newHearts - 1)
    }

    // Update XP if correct
    let xpGain = 0
    if (feedback.isCorrect) {
      xpGain = xpByCharacter[user?.character ?? 'momo'] ?? 10
      // Momo random multiplier
      if (user?.character === 'momo') {
        xpGain = xpGain * (Math.floor(Math.random() * 3) + 1)
      }
    }

    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        hearts: newHearts,
        xp: { increment: xpGain },
      },
    })

    return NextResponse.json({
      correct: feedback.isCorrect,
      explanation: feedback.explanation,
      suggestion: feedback.suggestion,
      heartsRemaining: newHearts,
      xpGained: xpGain,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Quiz submit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}