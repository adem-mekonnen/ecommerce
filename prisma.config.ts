// prisma.config.ts
import { defineConfig } from "@prisma/config";
import "dotenv/config"; // Loads .env variables

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing from .env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: dbUrl, // ✅ Correct property
    // shadowDatabaseUrl: process.env.DATABASE_SHADOW_URL, // optional for migrations
  },
});
