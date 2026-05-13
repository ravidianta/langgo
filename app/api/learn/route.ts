import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    const units = await prisma.unit.findMany({
      orderBy: { order: 'asc' },
      include: {
        topics: {
          orderBy: { order: 'asc' },
          include: {
            subLevels: {
              orderBy: { order: 'asc' },
              include: {
                progress: {
                  where: { userId: payload.userId },
                },
              },
            },
          },
        },
      },
    })

    // Calculate unlock status for each sublevel
    const processedUnits = units.map((unit, unitIndex) => {
      let prevUnitPassed = unitIndex === 0

      // Check if previous unit's final boss was passed
      if (unitIndex > 0) {
        const prevUnit = units[unitIndex - 1]
        const finalBossTopic = prevUnit.topics.find(t => t.subLevels.some(sl => sl.isUnitBoss))
        if (finalBossTopic) {
          const finalBoss = finalBossTopic.subLevels.find(sl => sl.isUnitBoss)
          prevUnitPassed = finalBoss?.progress.some(p => p.passed) ?? false
        }
      }

      const processedTopics = unit.topics.map((topic, topicIndex) => {
        let prevTopicPassed = topicIndex === 0 && prevUnitPassed

        if (topicIndex > 0 && prevUnitPassed) {
          const prevTopic = unit.topics[topicIndex - 1]
          const prevBoss = prevTopic.subLevels.find(sl => sl.isBoss)
          prevTopicPassed = prevBoss?.progress.some(p => p.passed) ?? false
        }

        const processedSubLevels = topic.subLevels.map((sl, slIndex) => {
          let isUnlocked = false

          if (slIndex === 0) {
            isUnlocked = prevTopicPassed
          } else {
            const prevSl = topic.subLevels[slIndex - 1]
            isUnlocked = prevSl.progress.some(p => p.passed) && prevTopicPassed
          }

          const isPassed = sl.progress.some(p => p.passed)
          const isActive = isUnlocked && !isPassed

          return {
            ...sl,
            isUnlocked,
            isPassed,
            isActive,
            progress: undefined,
          }
        })

        return { ...topic, subLevels: processedSubLevels, isUnlocked: prevTopicPassed }
      })

      return { ...unit, topics: processedTopics, isUnlocked: prevUnitPassed }
    })

    return NextResponse.json({ units: processedUnits, user })
  } catch (error) {
    console.error('Learn API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}