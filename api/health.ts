import type { VercelRequest, VercelResponse } from '@vercel/node';

async function queryDatabase(query: string): Promise<any> {
  const databaseUrl = process.env.DATABASE_URL!;
  
  // Extract connection details from DATABASE_URL
  const url = new URL(databaseUrl);
  const body = {
    query,
    params: []
  };

  const response = await fetch(`https://${url.hostname}/sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${url.password}`,
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Database query failed: ${response.statusText}`);
  }

  return response.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Test database connection with simple query
    await queryDatabase('SELECT 1 as test');
    
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