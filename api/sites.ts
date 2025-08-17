import type { VercelRequest, VercelResponse } from '@vercel/node';

async function queryDatabase(query: string, params: any[] = []): Promise<any> {
  const databaseUrl = process.env.DATABASE_URL!;
  
  // Extract connection details from DATABASE_URL
  const url = new URL(databaseUrl);
  const body = {
    query,
    params
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

  const result = await response.json();
  return result.rows || [];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        const sites = await queryDatabase(`
          SELECT id, url, domain, created_at as createdAt
          FROM sites 
          ORDER BY created_at DESC
        `);
        return res.status(200).json(sites);

      case 'POST':
        const { url, domain } = req.body;
        
        if (!url || !domain) {
          return res.status(400).json({ 
            message: "URL and domain are required" 
          });
        }

        const newSites = await queryDatabase(`
          INSERT INTO sites (url, domain) 
          VALUES ($1, $2)
          RETURNING id, url, domain, created_at as createdAt
        `, [url, domain]);
        
        return res.status(201).json(newSites[0]);

      case 'DELETE':
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ message: "Site ID is required" });
        }

        await queryDatabase('DELETE FROM sites WHERE id = $1', [id as string]);
        return res.status(200).json({ message: "Site deleted successfully" });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ message: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error("Sites API error:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}