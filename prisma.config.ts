// prisma.config.ts
import { defineConfig } from "@prisma/config";
import "dotenv/config"; // Loads .env variables

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("❌ DATABASE_URL is missing from .env file");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  
  datasource: {
    // ❌ REMOVED 'provider' (It belongs in schema.prisma)
    // ❌ REMOVED 'directUrl' (Not needed for local DB & not supported in this config type)
    url: dbUrl, 
  },
});