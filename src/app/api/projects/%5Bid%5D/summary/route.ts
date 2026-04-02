import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { getProjectInsights } from '@/lib/insights'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = params;

    const user = await db.user.findUnique({
      where: { clerkId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Phase 5 Intelligence Fetch
    const { stats, alerts } = await getProjectInsights(projectId);

    return NextResponse.json({
      summary: stats.aiSummary,
      riskLevel: stats.riskScore,
      stats,
      alerts
    })
  } catch (error) {
    console.error('Project Intelligence fetch failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
