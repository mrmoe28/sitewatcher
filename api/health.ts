import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Test database connection
    const sql = neon(process.env.DATABASE_URL!);
    await sql`SELECT 1 as test`;
    
    return res.status(200).json({ 
      status: "healthy", 
      database: "connected",
      environment: "vercel",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return res.status(500).json({ 
      status: "unhealthy", 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
}