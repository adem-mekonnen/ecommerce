// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // Prevent multiple instances of Prisma Client in development
  // This is useful for Next.js hot reload
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
