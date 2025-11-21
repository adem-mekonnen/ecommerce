// prisma.config.ts
import { defineConfig } from "@prisma/config";

export default defineConfig({
  // Point to your schema
  schema: "prisma/schema.prisma",
  
  // Configure the database connection
  datasource: {
    url: process.env.DATABASE_URL,
    shadowDatabaseUrl: process.env.DIRECT_URL, // use shadowDatabaseUrl to match the expected type
  },
});