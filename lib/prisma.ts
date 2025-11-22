import "dotenv/config";

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'
//import { PrismaClient } from '@prisma/client'
//const connectionString = `${process.env.DATABASE_URL}`
const connectionString = process.env.DATABASE_URL

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// 1. Create the Pool
const pool = new Pool({ connectionString })

// 2. Create the Adapter
const adapter = new PrismaPg(pool)

// 3. Initialize Prisma with the Adapter
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma