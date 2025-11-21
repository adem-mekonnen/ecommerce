// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// 1. Create a global variable to store the Prisma instance
// This prevents "Too many connections" errors during development (Hot Reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 2. Initialize Prisma
// You do NOT need to pass { datasources: ... } here. 
// Prisma Client automatically reads DATABASE_URL from your .env file.
export const prisma = globalForPrisma.prisma || new PrismaClient();

// 3. Save the instance to global in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;