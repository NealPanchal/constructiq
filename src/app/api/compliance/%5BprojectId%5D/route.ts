import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId: clerkId } = auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = params;

    const user = await db.user.findUnique({
      where: { clerkId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch history with violations
    const history = await db.complianceCheck.findMany({
      where: { projectId },
      include: {
        violations: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Compliance History fetch failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
