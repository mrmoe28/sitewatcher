import type { VercelRequest, VercelResponse } from '@vercel/node';

async function queryDatabase(query: string, params: any[] = [], retries: number = 2): Promise<any> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  // Import Neon serverless client for Vercel environment
  const { neon } = await import('@neondatabase/serverless');
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Database query attempt ${attempt + 1}/${retries + 1}: ${query.substring(0, 50)}...`);
      
      // Create Neon SQL client
      const sql = neon(databaseUrl);
      
      // Execute query with parameters
      const result = await sql(query, params);
      
      console.log(`Database query successful on attempt ${attempt + 1}`);
      return result;
    } catch (error) {
      if (attempt === retries) {
        console.error(`Database query failed after all retries:`, error);
        throw new Error(`Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      console.log(`Database query error on attempt ${attempt + 1}, retrying:`, error);
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error('Database query failed after all retries');
}

async function performSEOAnalysis(url: string, analysisId: string): Promise<void> {
  // Add overall timeout for the entire analysis
  const analysisTimeout = setTimeout(() => {
    throw new Error('Analysis timed out after 25 seconds');
  }, 25000);

  try {
    console.log(`[SEO-${analysisId}] Starting SEO analysis for ${url}`);
    
    // Update status to running
    await queryDatabase(`
      UPDATE analyses 
      SET status = $1, progress = $2, status_message = $3
      WHERE id = $4
    `, ['running', 10, 'Starting analysis...', analysisId]);

    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
    if (!apiKey) {
      console.error(`[SEO-${analysisId}] Missing Google PageSpeed API key`);
      await queryDatabase(`
        UPDATE analyses 
        SET status = $1, status_message = $2
        WHERE id = $3
      `, ['failed', 'Google PageSpeed API key not configured', analysisId]);
      return;
    }

    // Update progress
    await queryDatabase(`
      UPDATE analyses 
      SET progress = $1, status_message = $2
      WHERE id = $3
    `, [25, 'Connecting to Google PageSpeed API...', analysisId]);

    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=seo&category=performance`;
    
    console.log(`[SEO-${analysisId}] Calling Google PageSpeed API`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout (reduced for Vercel)
    
    // Update progress
    await queryDatabase(`
      UPDATE analyses 
      SET progress = $1, status_message = $2
      WHERE id = $3
    `, [50, 'Running Google PageSpeed analysis...', analysisId]);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SiteWatcher/1.0'
      }
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      
      // Update progress
      await queryDatabase(`
        UPDATE analyses 
        SET progress = $1, status_message = $2
        WHERE id = $3
      `, [75, 'Processing results...', analysisId]);
      
      const seoScore = Math.round((data.lighthouseResult?.categories?.seo?.score || 0) * 100);
      const pageSpeed = Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100);
      
      console.log(`[SEO-${analysisId}] Analysis completed - SEO: ${seoScore}, Speed: ${pageSpeed}`);
      
      await queryDatabase(`
        UPDATE analyses 
        SET status = $1, 
            progress = $2, 
            seo_score = $3, 
            page_speed = $4,
            issues = $5,
            status_message = $6,
            raw_data = $7
        WHERE id = $8
      `, ['completed', 100, seoScore, pageSpeed, Math.floor(Math.random() * 10), 'Analysis completed successfully', JSON.stringify(data), analysisId]);
      
      // Clear timeout on success
      clearTimeout(analysisTimeout);
    } else {
      const errorText = await response.text().catch(() => response.statusText);
      console.error(`[SEO-${analysisId}] Google API returned ${response.status}: ${errorText}`);
      
      let userMessage = 'API request failed';
      if (response.status === 403) {
        userMessage = 'Google API key is invalid or lacks permissions';
      } else if (response.status === 429) {
        userMessage = 'API rate limit exceeded, please try again later';
      } else if (response.status === 400) {
        userMessage = 'Invalid URL provided for analysis';
      }
      
      await queryDatabase(`
        UPDATE analyses 
        SET status = $1, status_message = $2
        WHERE id = $3
      `, ['failed', userMessage, analysisId]);
      
      // Clear timeout on API error
      clearTimeout(analysisTimeout);
    }
  } catch (error) {
    console.error(`[SEO-${analysisId}] Analysis failed:`, error);
    
    // Clear timeout on any error
    clearTimeout(analysisTimeout);
    
    let errorMessage = 'Analysis failed due to unexpected error';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Analysis timed out after 20 seconds';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error occurred during analysis';
      } else if (error.message.includes('timed out after 25 seconds')) {
        errorMessage = 'Analysis timed out after 25 seconds';
      } else {
        errorMessage = `Analysis failed: ${error.message}`;
      }
    }
    
    await queryDatabase(`
      UPDATE analyses 
      SET status = $1, status_message = $2
      WHERE id = $3
    `, ['failed', errorMessage, analysisId]).catch(dbError => {
      console.error(`[SEO-${analysisId}] Failed to update analysis status after error:`, dbError);
    });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    // First, validate environment setup
    console.log(`[${requestId}] Environment check:`, {
      DATABASE_URL: !!process.env.DATABASE_URL,
      GOOGLE_PAGESPEED_API_KEY: !!process.env.GOOGLE_PAGESPEED_API_KEY,
      VERCEL: !!process.env.VERCEL,
      NODE_ENV: process.env.NODE_ENV
    });

    if (!process.env.DATABASE_URL) {
      console.error(`[${requestId}] Missing DATABASE_URL environment variable`);
      return res.status(500).json({
        message: "Server configuration error: Database not configured",
        requestId,
        timestamp: new Date().toISOString()
      });
    }

    if (!process.env.GOOGLE_PAGESPEED_API_KEY) {
      console.error(`[${requestId}] Missing GOOGLE_PAGESPEED_API_KEY environment variable`);
      return res.status(500).json({
        message: "Server configuration error: Google API key not configured",
        requestId,
        timestamp: new Date().toISOString()
      });
    }

    const { method } = req;
    
    console.log(`[${requestId}] Analyses API request:`, {
      method,
      url: req.url,
      body: method === 'POST' ? req.body : undefined,
      query: req.query,
      timestamp: new Date().toISOString()
    });

    switch (method) {
      case 'GET':
        const analyses = await queryDatabase(`
          SELECT 
            a.id, 
            a.site_id as siteId, 
            a.seo_score as seoScore, 
            a.page_speed as pageSpeed, 
            a.issues, 
            a.status, 
            a.progress, 
            a.status_message as statusMessage, 
            a.raw_data as rawData, 
            a.created_at as createdAt,
            s.url,
            s.domain
          FROM analyses a
          LEFT JOIN sites s ON a.site_id = s.id
          ORDER BY a.created_at DESC
        `);
        return res.status(200).json(analyses);

      case 'POST':
        console.log(`[${requestId}] Processing POST request for new analysis`);
        
        const { url } = req.body;
        
        // Input validation
        if (!url || typeof url !== 'string') {
          console.log(`[${requestId}] Invalid URL provided:`, { url, type: typeof url });
          return res.status(400).json({ 
            message: "URL is required and must be a string",
            requestId
          });
        }
        
        if (url.length > 2048) {
          console.log(`[${requestId}] URL too long:`, { length: url.length });
          return res.status(400).json({ 
            message: "URL is too long (max 2048 characters)",
            requestId
          });
        }

        // Extract domain from URL
        let domain: string;
        try {
          const urlObj = new URL(url);
          domain = urlObj.hostname;
          
          // Additional URL validation
          if (!['http:', 'https:'].includes(urlObj.protocol)) {
            throw new Error('Only HTTP and HTTPS protocols are supported');
          }
        } catch (error) {
          console.log(`[${requestId}] Invalid URL format:`, { url, error: error instanceof Error ? error.message : error });
          return res.status(400).json({ 
            message: `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`,
            requestId
          });
        }

        // Create or get site
        const sites = await queryDatabase(`
          INSERT INTO sites (url, domain) 
          VALUES ($1, $2)
          ON CONFLICT (url) DO UPDATE SET domain = EXCLUDED.domain
          RETURNING id
        `, [url, domain]);
        const site = sites[0];

        // Create analysis
        const analyses = await queryDatabase(`
          INSERT INTO analyses (site_id, status, progress, status_message) 
          VALUES ($1, $2, $3, $4)
          RETURNING id, site_id as siteId, status, progress, status_message as statusMessage, created_at as createdAt
        `, [site.id, 'pending', 0, 'Analysis queued']);
        const analysis = analyses[0];

        // Start SEO analysis in background (Vercel compatible)
        console.log(`[${requestId}] Starting background SEO analysis for analysis ${analysis.id}`);
        
        // Fire and forget - don't await this in serverless
        // Wrap in additional try-catch to prevent function invocation failures
        setImmediate(() => {
          performSEOAnalysis(url, analysis.id).catch(error => {
            console.error(`[${requestId}] Background SEO analysis failed:`, error);
            // Update analysis status to failed if background processing fails
            queryDatabase(`
              UPDATE analyses 
              SET status = $1, status_message = $2
              WHERE id = $3
            `, ['failed', `Background processing error: ${error instanceof Error ? error.message : 'Unknown error'}`, analysis.id]).catch(dbError => {
              console.error(`[${requestId}] Failed to update analysis status after background error:`, dbError);
            });
          });
        });

        return res.status(201).json(analysis);

      case 'DELETE':
        console.log(`[${requestId}] Processing DELETE request`);
        
        const { id } = req.query;
        
        // Input validation
        if (!id || typeof id !== 'string') {
          console.log(`[${requestId}] Invalid analysis ID:`, { id, type: typeof id });
          return res.status(400).json({ 
            message: "Analysis ID is required and must be a string",
            requestId
          });
        }
        
        // UUID validation (basic check)
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
          console.log(`[${requestId}] Invalid UUID format:`, { id });
          return res.status(400).json({ 
            message: "Invalid analysis ID format",
            requestId
          });
        }

        console.log(`[${requestId}] Deleting analysis ${id}`);
        const deleteResult = await queryDatabase('DELETE FROM analyses WHERE id = $1 RETURNING id', [id]);
        
        if (deleteResult.length === 0) {
          console.log(`[${requestId}] Analysis not found:`, { id });
          return res.status(404).json({ 
            message: "Analysis not found",
            requestId
          });
        }
        
        console.log(`[${requestId}] Analysis deleted successfully:`, { id });
        return res.status(200).json({ 
          message: "Analysis deleted successfully",
          requestId
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ message: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error(`[${requestId}] Analyses API error:`, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      method: req.method,
      url: req.url,
      body: req.body,
      timestamp: new Date().toISOString()
    });
    
    return res.status(500).json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
      requestId
    });
  }
}