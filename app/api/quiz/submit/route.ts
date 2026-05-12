import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { getGrammarFeedback } from '@/lib/openai'

const submitSchema = z.object({
  questionId: z.string().uuid(),
  userAnswer: z.string().min(1).max(1000),
})

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    const body = await request.json()
    const { questionId, userAnswer } = submitSchema.parse(body)

    // Sanitize input — strip any HTML tags
    const sanitizedAnswer = userAnswer.replace(/<[^>]*>/g, '').trim()

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Get AI feedback for free text and translation questions
    let feedback = null
    if (question.type === 'FREE_TEXT' || question.type === 'TRANSLATION') {
      feedback = await getGrammarFeedback(
        question.prompt,
        question.correctAnswer,
        sanitizedAnswer
      )
    } else {
      // Multiple choice — simple comparison
      feedback = {
        isCorrect: sanitizedAnswer.toLowerCase() === question.correctAnswer.toLowerCase(),
        explanation: '',
        suggestion: '',
      }
    }

    // Save attempt to database
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: payload.userId,
        questionId,
        userAnswer: sanitizedAnswer,
        isCorrect: feedback.isCorrect,
        aiFeedback: feedback.explanation,
      },
    })

    // Update user difficulty score based on last 5 attempts
    const recentAttempts = await prisma.quizAttempt.findMany({
      where: { userId: payload.userId },
      orderBy: { attemptedAt: 'desc' },
      take: 5,
    })

    const correctCount = recentAttempts.filter(a => a.isCorrect).length
    const newDifficulty = correctCount >= 4 ? 3 : correctCount >= 2 ? 2 : 1

    await prisma.user.update({
      where: { id: payload.userId },
      data: { difficultyScore: newDifficulty },
    })

    return NextResponse.json({
      correct: feedback.isCorrect,
      explanation: feedback.explanation,
      suggestion: feedback.suggestion,
      attemptId: attempt.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}