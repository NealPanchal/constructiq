import { db } from './db'

export type ActivityType = 
  | 'project_created'
  | 'file_uploaded'
  | 'task_created'
  | 'task_updated'
  | 'member_added'
  | 'member_removed'

/**
 * Centrally log events for the Project Hub timeline.
 * Ensures data consistency for activity tracking across all API routes.
 */
export async function logActivity(
  userId: string,
  projectId: string,
  type: ActivityType,
  message: string
) {
  try {
    const log = await db.activityLog.create({
      data: {
        userId,
        projectId,
        type,
        message,
      }
    })
    return log
  } catch (error) {
    console.error('Activity Logging failed:', error)
    // We don't throw here to avoid failing the main user action if logs fail
  }
}
