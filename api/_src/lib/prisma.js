const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

function isDbConnectionError(err) {
  const msg = (err?.message || '').toLowerCase();
  return (
    msg.includes('connection') ||
    msg.includes('reach database') ||
    msg.includes('timeout') ||
    msg.includes('closed') ||
    msg.includes('econnrefused') ||
    msg.includes('etimedout') ||
    err?.code === 'P2024' ||
    err?.code === 'P1001' ||
    err?.code === 'P1008' ||
    err?.name === 'PrismaClientInitializationError'
  );
}

async function executeWithRetry(fn, maxRetries = 3, delayMs = 1200) {
  let lastErr;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries && isDbConnectionError(err)) {
        console.warn(`[PRISMA] Database cold start / connection timeout (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`);
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }
  throw lastErr;
}

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

prisma.executeWithRetry = executeWithRetry;
prisma.isDbConnectionError = isDbConnectionError;

module.exports = prisma;
