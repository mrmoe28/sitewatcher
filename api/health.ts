import type { VercelRequest, VercelResponse } from '@vercel/node';

async function queryDatabase(query: string): Promise<any> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  const body = {
    query,
    params: []
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(`https://${url.hostname}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${url.password}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response');
      throw new Error(`Database query failed (${response.status}): ${errorText}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Database query timed out after 5 seconds');
    }
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] Health check started`, {
      method: req.method,
      url: req.url,
      headers: Object.keys(req.headers),
      environment: {
        VERCEL: !!process.env.VERCEL,
        DATABASE_URL: !!process.env.DATABASE_URL
      }
    });

    // Test database connection with simple query
    console.log(`[${requestId}] Testing database connection`);
    const dbResult = await queryDatabase('SELECT 1 as test');
    console.log(`[${requestId}] Database test successful:`, dbResult);
    
    const response = { 
      status: "healthy", 
      database: "connected",
      environment: "vercel",
      timestamp: new Date().toISOString(),
      requestId
    };
    
    console.log(`[${requestId}] Health check completed successfully`);
    return res.status(200).json(response);
  } catch (error) {
    console.error(`[${requestId}] Health check failed:`, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      environment: {
        VERCEL: !!process.env.VERCEL,
        DATABASE_URL: !!process.env.DATABASE_URL
      }
    });
    
    return res.status(500).json({ 
      status: "unhealthy", 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      requestId
    });
  }
}