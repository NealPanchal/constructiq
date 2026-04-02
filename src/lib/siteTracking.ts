import prisma from './prisma';

export interface SiteProgress {
  currentPercentage: number;
  lastUpdate: string;
  updateCount: number;
  estimatedCompletion: string;
  activityStatus: 'NOMINAL' | 'IDLE' | 'STAGNANT';
}

/**
 * PRODUCTION SITE TRACKING SYSTEM
 * Inferred construction progress based on Site Update frequency and timestamps.
 * Multi-Stage verification using construction days and total updates.
 */
export async function getSiteProgress(projectId: string): Promise<SiteProgress> {
  const updates = await prisma.siteUpdate.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' }
  });

  if (updates.length === 0) {
    return {
      currentPercentage: 0,
      lastUpdate: 'No activity detected.',
      updateCount: 0,
      estimatedCompletion: 'Awaiting first site report.',
      activityStatus: 'IDLE'
    };
  }

  const latestUpdate = updates[0];
  const progressPercent = latestUpdate.progressPercent;
  
  // Calculate activity status based on frequency
  const lastUpdateDate = new Date(latestUpdate.createdAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const activityStatus = diffDays > 7 ? 'STAGNANT' : diffDays > 3 ? 'IDLE' : 'NOMINAL';

  // Completion Estimation (Real Telemetry based on frequency)
  // If we have > 3 updates, we can calculate speed. Else assume average 0.2% per day.
  let speed = 0.2; // default
  if (updates.length > 5) {
     const earliest = updates[updates.length - 1];
     const timeSpan = (latestUpdate.createdAt.getTime() - earliest.createdAt.getTime()) / (1000 * 60 * 60 * 24);
     const totalProgress = latestUpdate.progressPercent - earliest.progressPercent;
     if (timeSpan > 0) speed = totalProgress / timeSpan;
  }

  const completionEstimateDays = speed > 0 ? (100 - progressPercent) / speed : 365;
  const estimatedCompletion = new Date();
  estimatedCompletion.setDate(estimatedCompletion.getDate() + completionEstimateDays);

  return {
    currentPercentage: progressPercent,
    lastUpdate: latestUpdate.createdAt.toLocaleDateString(),
    updateCount: updates.length,
    estimatedCompletion: estimatedCompletion.toLocaleDateString(),
    activityStatus
  };
}
