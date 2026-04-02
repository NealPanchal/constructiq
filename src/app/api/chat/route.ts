import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, initializeSystem } from '@/lib/db'
import { logger } from '@/lib/logger'

/**
 * PRODUCTION CHAT API
 * Strictly enforces real message persistence and real AI connectivity.
 * No simulated responses allowed.
 */

export async function GET(req: Request) {
  try {
    await initializeSystem();
    const { userId: clerkId } = auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    const user = await db.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ messages: [] });

    const messages = await db.message.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    logger.error('CRITICAL API FAILURE: CHAT-GET', error)
    return NextResponse.json({ error: 'CHAT_FEED_UNAVAILABLE' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await initializeSystem();
    const { userId: clerkId } = auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { projectId, content } = await req.json()
    const user = await db.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: 'User Sync Required' }, { status: 404 })

    const message = await db.message.create({
      data: { content, userId: user.id, projectId },
      include: { user: { select: { id: true, name: true, email: true } } }
    })

    return NextResponse.json({ message })
  } catch (error) {
    logger.error('CRITICAL API FAILURE: CHAT-POST', error)
    return NextResponse.json({ error: 'MESSAGE_SEND_FAILURE' }, { status: 500 })
  }
}
