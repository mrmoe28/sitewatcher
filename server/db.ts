import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import { Pool as NodePool } from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";

// Default to local PostgreSQL for development if no DATABASE_URL is provided
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://localhost:5432/sitewatcher_dev";

// Check if using Neon (serverless) or local PostgreSQL
const isNeon = DATABASE_URL.includes('neon.tech') || DATABASE_URL.includes('neon.db');

let pool: Pool | NodePool;
let db: any;

if (isNeon) {
  // Use Neon serverless configuration for production
  neonConfig.webSocketConstructor = ws;
  pool = new Pool({ connectionString: DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // Use local PostgreSQL configuration for development
  pool = new NodePool({ 
    connectionString: DATABASE_URL,
    // Allow connections without SSL for local development
    ssl: false 
  });
  db = drizzleNode(pool, { schema });
}

export { pool, db };