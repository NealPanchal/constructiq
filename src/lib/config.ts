import { logger } from './logger';

/**
 * CONSTRUCTIQ CONFIGURATION & VALIDATION
 * Enforces production-grade environment constraints.
 */
const requiredEnv = [
  'DATABASE_URL',
  'GROQ_API_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
];

export function validateConfig() {
  const missing = requiredEnv.filter(key => !process.env[key]);

  if (missing.length > 0) {
    logger.error(`CRITICAL FAILURE: Missing required environment variables: ${missing.join(', ')}`);
    // In local dev, we warn but allow startup to help the user fix it.
    // In production, this should prevent startup.
    return false;
  }

  logger.success('Environment Configuration Validated');
  return true;
}

export const config = {
  db: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL
  },
  ai: {
    groqKey: process.env.GROQ_API_KEY
  },
  auth: {
    clerkPublicKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    clerkSecretKey: process.env.CLERK_SECRET_KEY
  }
};
