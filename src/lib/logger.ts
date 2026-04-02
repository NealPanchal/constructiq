/**
 * ConstructIQ Centralized Logger
 * Provides consistent terminal formatting for server-side events.
 */
export const logger = {
  info: (msg: string, ctx?: any) => {
    console.log(`[INFO]  [${new Date().toLocaleTimeString()}] ${msg}`, ctx || '');
  },
  success: (msg: string, ctx?: any) => {
    console.log(`[READY] [${new Date().toLocaleTimeString()}] ✅ ${msg}`, ctx || '');
  },
  warn: (msg: string, ctx?: any) => {
    console.warn(`[WARN]  [${new Date().toLocaleTimeString()}] ⚠️ ${msg}`, ctx || '');
  },
  error: (msg: string, err?: any) => {
    console.error(`[ERROR] [${new Date().toLocaleTimeString()}] ❌ ${msg}`, err || '');
  },
  ai: (msg: string, ctx?: any) => {
    console.log(`[AI]    [${new Date().toLocaleTimeString()}] 🤖 ${msg}`, ctx || '');
  },
  db: (msg: string, ctx?: any) => {
    console.log(`[DB]    [${new Date().toLocaleTimeString()}] 🗄️ ${msg}`, ctx || '');
  }
};
