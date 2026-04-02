import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, initializeSystem } from '@/lib/db'
import { logger } from '@/lib/logger'
import { orchestrateProjectDiagnostics, logProjectActivity } from '@/lib/orchestrator'

/**
 * PRODUCTION PROJECT LIFECYCLE API
 * Strictly enforces real database persistence and user isolation.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await initializeSystem();
    const { userId: clerkId } = auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, location, plotArea, builtUpArea, city, type, status } = await req.json()

    const user = await db.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: 'User Sync Required' }, { status: 404 })

    // Verify Ownership
    const project = await db.project.findUnique({
      where: { id: params.id, userId: user.id }
    });

    if (!project) return NextResponse.json({ error: 'Project Protocol Access Denied' }, { status: 403 })

    // 1. Update Project Data
    const updatedProject = await db.project.update({
      where: { id: params.id },
      data: {
        name,
        location,
        plotArea: plotArea ? parseFloat(plotArea) : undefined,
        builtUpArea: builtUpArea ? parseFloat(builtUpArea) : undefined,
        city,
        type,
        status
      }
    });

    // 2. Re-run Diagnostics Protocol if engineering dimensions changed
    if (plotArea || builtUpArea || city) {
      await orchestrateProjectDiagnostics(updatedProject.id);
      await logProjectActivity(updatedProject.id, user.id, "PROJECT_UPDATED", "Engineering reconfiguration complete. All diagnostics recalibrated.");
    }

    return NextResponse.json({ project: updatedProject })
  } catch (error) {
    logger.error('CRITICAL API FAILURE: PROJECTS-PATCH', error)
    return NextResponse.json({ error: 'UNABLE_TO_UPDATE_PROJECT' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await initializeSystem();
    const { userId: clerkId } = auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: 'User Sync Required' }, { status: 404 })

    // Verify Ownership
    const project = await db.project.findUnique({
      where: { id: params.id, userId: user.id }
    });

    if (!project) return NextResponse.json({ error: 'Project Protocol Access Denied' }, { status: 403 })

    // 1. Log Closure Activity before deletion
    await logProjectActivity(project.id, user.id, "PROJECT_DELETED", `Project ${project.name} decommissioned from managed portfolio.`);

    // 2. Persistent Deletion
    await db.project.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('CRITICAL API FAILURE: PROJECTS-DELETE', error)
    return NextResponse.json({ error: 'UNABLE_TO_DELETE_PROJECT' }, { status: 500 })
  }
}
