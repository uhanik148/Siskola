import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Determine which Database URL to use based on DB_SOURCE env var
const dbSource = process.env.DB_SOURCE || 'local';
let connectionString = process.env.DATABASE_URL; // Default fallback

// Override connection string logic
if (dbSource === 'neon' && process.env.DATABASE_URL_NEON) {
  connectionString = process.env.DATABASE_URL_NEON;
  if (process.env.NODE_ENV === 'development') console.log('🚀 [Prisma] Connected to NEON Cloud Database');
} else if (dbSource === 'local' && process.env.DATABASE_URL_LOCAL) {
  connectionString = process.env.DATABASE_URL_LOCAL;
  if (process.env.NODE_ENV === 'development') console.log('💻 [Prisma] Connected to LOCAL Database');
}

// Ensure connection string is valid
if (!connectionString) {
  throw new Error('Database connection string is undetermined. Check your .env file.');
}

const pool = new Pool({
  connectionString,
  max: 10,                      // Maximum pool connections
  idleTimeoutMillis: 60000,     // Close idle connections after 60s
  connectionTimeoutMillis: 10000, // Timeout after 10s if can't connect
  keepAlive: true,              // Prevent Neon cold starts
  keepAliveInitialDelayMillis: 10000,
});
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
