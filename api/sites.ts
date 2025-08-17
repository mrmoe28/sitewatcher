import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        const sites = await sql`
          SELECT id, url, domain, created_at as "createdAt"
          FROM sites 
          ORDER BY created_at DESC
        `;
        return res.status(200).json(sites);

      case 'POST':
        const { url, domain } = req.body;
        
        if (!url || !domain) {
          return res.status(400).json({ 
            message: "URL and domain are required" 
          });
        }

        const [newSite] = await sql`
          INSERT INTO sites (url, domain) 
          VALUES (${url}, ${domain})
          RETURNING id, url, domain, created_at as "createdAt"
        `;
        return res.status(201).json(newSite);

      case 'DELETE':
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ message: "Site ID is required" });
        }

        await sql`DELETE FROM sites WHERE id = ${id as string}`;
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