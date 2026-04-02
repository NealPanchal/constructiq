import prisma from './prisma';
import { logger } from './logger';

/**
 * PURE PRODUCTION USER SYNCHRONIZATION PROTOCOL
 * Strictly enforces user synchronization with the live database cluster.
 * Any connection failure will trigger a transparent system error.
 */
export async function createUser(clerkId: string, email: string) {
  try {
    logger.info(`[USER SYNC] Protocol ${clerkId.slice(0, 8)}`);
    
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          email,
          name: email.split('@')[0],
        },
      });
      logger.success("[USER SYNC] Base Protocol Established.");
    }

    return user;
  } catch (error) {
    logger.error("[USER SYNC] FAILED. Critical synchronization error.", error);
    // Pure Production Mode: Return null to allow the UI to handle the disconnection
    return null;
  }
}
