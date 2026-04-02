import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

/**
 * PURE PRODUCTION PRISMA CLIENT
 * Strictly enforces real database connectivity. No Safe Mode or Mock fallbacks.
 */

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasourceUrl: process.env.DATABASE_URL,
  });
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  // @ts-ignore
  prisma = global.prisma;
}

/**
 * SYSTEM INITIALIZER: DATABASE CONNECTIVITY CHECK
 * Verifies the database link and establishes the operational baseline.
 */
export async function initializeSystem(): Promise<boolean> {
  try {
    logger.info("[DB STATUS] INITIATING CONNECTIVITY CHECK...");
    await prisma.$connect();
    logger.success("[DB STATUS] CONNECTED.");
    return true;
  } catch (error) {
    logger.error("[DB STATUS] FAILED. Critical connection error (P1001/Network).");
    return false;
  }
}

export default prisma;
