// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// This ensures we use a single PrismaClient instance during development
// Prevents "Cannot reinstantiate PrismaClient" errors with Next.js hot reload
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // optional, useful for debugging
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
