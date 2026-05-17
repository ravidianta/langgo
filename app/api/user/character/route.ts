import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const schema = z.object({
  character: z.enum(['momo', 'nadia', 'kai', 'raka', 'dinda']),
})

const heartsByCharacter: Record<string, number> = {
  momo: 7,
  nadia: 5,
  kai: 5,
  raka: 5,
  dinda: 8,
}

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    const body = await request.json()
    const { character } = schema.parse(body)

    const maxHearts = heartsByCharacter[character]

    await prisma.user.update({
      where: { id: payload.userId },
      data: { character, hearts: maxHearts, maxHearts },
    })

    return NextResponse.json({ message: 'Character saved' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}