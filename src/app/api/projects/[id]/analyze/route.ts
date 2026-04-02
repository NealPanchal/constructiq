import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, initializeSystem } from '@/lib/db'
import { logger } from '@/lib/logger'
import { runComplianceCheck } from '@/lib/complianceEngine'
import { generateAIReport } from '@/lib/groq'
import { logProjectActivity } from '@/lib/orchestrator'

/**
 * PRODUCTION PERSISTENT AI ANALYSIS
 * Generates a high-fidelity strategic report and persists the structured result to the database.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await initializeSystem();
    const { userId: clerkId } = auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: 'User Sync Required' }, { status: 404 })

    // 1. Fetch Project State
    const project = await db.project.findUnique({
      where: { id: params.id, userId: user.id }
    });

    if (!project) return NextResponse.json({ error: 'Project Protocol Access Denied' }, { status: 403 });

    // 2. Refresh Compliance Data
    logger.info(`RESCANNING COMPLIANCE: Project ${project.name}`);
    const complianceResult = await runComplianceCheck(project.id, {
       plotSize: project.plotArea || 0,
       floors: 2,
       buildingHeight: 7,
       city: project.city || 'Chennai'
    });
    
    // 3. Generate Strategic AI Reasoning
    logger.info(`GENERATING PERSISTENT AI REPORT: Project ${project.name}`);
    const aiReportContent = await generateAIReport(complianceResult, project);

    // 4. Persist Analysis Result to DB
    const updatedProject = await db.project.update({
      where: { id: project.id },
      data: {
        aiReport: {
          content: aiReportContent,
          timestamp: new Date().toISOString(),
          status: 'verified'
        } as any
      }
    });

    // 5. Log Activity
    await logProjectActivity(project.id, user.id, "AI_ANALYSIS_RUN", "Strategic Intelligence Reasoning report generated and archived.");

    return NextResponse.json({
      aiReport: updatedProject.aiReport,
      status: 'PRODUCTION-SAAS-PERSISTENT'
    })

  } catch (error) {
    logger.error('CRITICAL API FAILURE: ANALYZE-PROJECT', error)
    return NextResponse.json({ error: 'ANALYSIS_PROTOCOL_FAILURE' }, { status: 500 })
  }
}
