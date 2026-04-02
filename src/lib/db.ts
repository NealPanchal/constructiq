import prisma, { initializeSystem as initPrisma } from "./prisma";
import { validateConfig } from "./config";
import { logger } from "./logger";

/**
 * PURE PRODUCTION SYSTEM INITIALIZER
 * Centralized entry point for environment validation and database connectivity.
 * No Safe Mode or Mock fallbacks allowed.
 */
let isInitialized = false;

export async function initializeSystem() {
  if (isInitialized) return prisma;

  logger.info("[SYSTEM STARTUP] Protocol IQ-PURE-PROD-V5.2");
  
  // 1. Validate Environment
  validateConfig();

  // 2. Connect Database (Persistent check)
  const isConnected = await initPrisma();
  
  if (!isConnected) {
    logger.error("[SYSTEM STATUS] FAILED. Data persistence protocols offline.");
  } else {
    logger.success("[SYSTEM STATUS] CONNECTED / FULLY OPERATIONAL.");
  }

  isInitialized = true;
  return prisma;
}

export const db = prisma;
export default prisma;
