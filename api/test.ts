import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const timestamp = new Date().toISOString();
    
    return res.status(200).json({
      status: "ok",
      message: "Simple test endpoint working",
      timestamp,
      method: req.method,
      url: req.url,
      environment: {
        VERCEL: process.env.VERCEL,
        DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT_SET",
        GOOGLE_PAGESPEED_API_KEY: process.env.GOOGLE_PAGESPEED_API_KEY ? "SET" : "NOT_SET"
      }
    });
  } catch (error) {
    console.error("Test handler error:", error);
    return res.status(500).json({
      error: "Test failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}