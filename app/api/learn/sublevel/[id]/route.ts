import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    const { id } = await params

    const subLevel = await prisma.subLevel.findUnique({
      where: { id },
      include: {
        questions: true,
        topic: {
          include: {
            unit: true,
          },
        },
      },
    })

    if (!subLevel) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    return NextResponse.json({ subLevel, user })
  } catch (error) {
    console.error('Sublevel API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}