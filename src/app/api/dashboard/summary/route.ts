import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { getProjectInsights } from '@/lib/insights'

export async function GET() {
  try {
    const { userId: clerkId } = auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { clerkId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const projects = await db.project.findMany({
      where: {
        OR: [
          { userId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      }
    })

    // Aggragate stats across all projects
    const projectInsightList = await Promise.all(
      projects.map(p => getProjectInsights(p.id))
    );

    const totalActive = projects.length;
    const avgProgress = totalActive > 0 
      ? Math.round(projectInsightList.reduce((acc, curr) => acc + curr.stats.progressPercentage, 0) / totalActive)
      : 0;
    
    const projectsWithViolations = projectInsightList.filter(p => p.stats.complianceStatus === 'fail').length;

    return NextResponse.json({
      summary: {
        totalActive,
        avgProgress,
        projectsWithViolations
      }
    })
  } catch (error) {
    console.error('Dashboard Overview fetch failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
