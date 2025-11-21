// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
        directUrl: process.env.DIRECT_URL,
      },
    },
  });
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
          directUrl: process.env.DIRECT_URL,
        },
      },
    });
  }
  prisma = (global as any).prisma;
}

export default prisma;
