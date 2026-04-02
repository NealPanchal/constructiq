import prisma from './prisma';
import { runComplianceCheck } from './complianceEngine';
import { getMaterialEstimate } from './costEngine';
import { getSiteProgress } from './siteTracking';
import { logger } from './logger';

/**
 * PRODUCTION SAAS ORCHESTRATOR
 * Coordinates all engineering engines and persists summary diagnostics to the Project model.
 * Ensures the Database is the single source of truth for dashboard telemetry.
 */
export async function orchestrateProjectDiagnostics(projectId: string) {
  try {
    logger.info(`ORCHESTRATING DIAGNOSTICS: Protocol ${projectId}`);

    // 1. Fetch Project State
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        siteUpdates: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    if (!project) throw new Error("Project not found for orchestration.");

    // 2. Execute Engineering Engines
    const [compliance, materials, site] = await Promise.all([
      runComplianceCheck(projectId, { 
        buildingHeight: 7, 
        city: project.city || 'Chennai' 
      }),
      getMaterialEstimate(projectId, project.builtUpArea || 0),
      getSiteProgress(projectId)
    ]);

    // 3. Persist Centralized Telemetry
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        complianceStatus: compliance.status,
        violations: compliance.violations.map(v => v.message) as any,
        costEstimate: materials.totalCost,
        materialBreakdown: {
          cement: materials.cement,
          steel: materials.steel,
          bricks: materials.bricks,
          sand: materials.sand
        } as any,
        siteProgress: site.currentPercentage,
      }
    });

    logger.success(`DIAGNOSTICS PERSISTED: Protocol ${projectId} Stable`);
    return updatedProject;
  } catch (error) {
    logger.error(`ORCHESTRATION FAILURE: Protocol ${projectId}`, error);
    throw error;
  }
}

/**
 * LOG ACTIVITY PROTOCOL
 */
export async function logProjectActivity(projectId: string, userId: string, type: string, message: string) {
  try {
    await prisma.activityLog.create({
      data: {
        projectId,
        userId,
        type,
        message
      }
    });
  } catch (error) {
    logger.error("ACTIVITY LOG FAILURE", error);
  }
}
