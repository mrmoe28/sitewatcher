import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

// Environment check and setup
const DATABASE_URL = process.env.DATABASE_URL;
const GOOGLE_API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY || process.env.GOOGLE_API_KEY;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not configured');
}

if (!GOOGLE_API_KEY) {
  console.error('❌ GOOGLE_API_KEY not configured');
}

// Simple logging function
function log(message: string, source = "analyzer") {
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${time} [${source}] ${message}`);
}

// Database connection using Neon HTTP
const sql = neon(DATABASE_URL || '');

// Simple validation functions
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

function validateSiteData(data: any): { url: string; domain: string } {
  if (!data.url || typeof data.url !== 'string') {
    throw new Error('URL is required and must be a string');
  }
  
  if (!isValidUrl(data.url)) {
    throw new Error('Invalid URL format');
  }
  
  const domain = new URL(data.url).hostname;
  return { url: data.url, domain };
}

// Database operations
async function getAllSites() {
  try {
    const sites = await sql`SELECT * FROM sites ORDER BY created_at DESC`;
    return sites;
  } catch (error) {
    log(`Database error getting sites: ${error instanceof Error ? error.message : 'Unknown error'}`, 'db');
    throw error;
  }
}

async function createSite(url: string, domain: string) {
  try {
    const [site] = await sql`
      INSERT INTO sites (url, domain) 
      VALUES (${url}, ${domain}) 
      RETURNING *
    `;
    return site;
  } catch (error) {
    log(`Database error creating site: ${error instanceof Error ? error.message : 'Unknown error'}`, 'db');
    throw error;
  }
}

async function getSiteByUrl(url: string) {
  try {
    const [site] = await sql`SELECT * FROM sites WHERE url = ${url}`;
    return site || null;
  } catch (error) {
    log(`Database error getting site by URL: ${error instanceof Error ? error.message : 'Unknown error'}`, 'db');
    throw error;
  }
}

async function createAnalysis(siteId: string, status = 'pending', progress = 0, statusMessage = 'Analysis queued') {
  try {
    const [analysis] = await sql`
      INSERT INTO analyses (site_id, status, progress, status_message) 
      VALUES (${siteId}, ${status}, ${progress}, ${statusMessage}) 
      RETURNING *
    `;
    return analysis;
  } catch (error) {
    log(`Database error creating analysis: ${error instanceof Error ? error.message : 'Unknown error'}`, 'db');
    throw error;
  }
}

async function updateAnalysis(id: string, updates: any) {
  try {
    const setParts = [];
    const values = [];
    
    if (updates.status !== undefined) {
      setParts.push(`status = $${values.length + 1}`);
      values.push(updates.status);
    }
    if (updates.progress !== undefined) {
      setParts.push(`progress = $${values.length + 1}`);
      values.push(updates.progress);
    }
    if (updates.status_message !== undefined) {
      setParts.push(`status_message = $${values.length + 1}`);
      values.push(updates.status_message);
    }
    if (updates.seo_score !== undefined) {
      setParts.push(`seo_score = $${values.length + 1}`);
      values.push(updates.seo_score);
    }
    if (updates.page_speed !== undefined) {
      setParts.push(`page_speed = $${values.length + 1}`);
      values.push(updates.page_speed);
    }
    if (updates.issues !== undefined) {
      setParts.push(`issues = $${values.length + 1}`);
      values.push(updates.issues);
    }
    if (updates.raw_data !== undefined) {
      setParts.push(`raw_data = $${values.length + 1}`);
      values.push(JSON.stringify(updates.raw_data));
    }
    
    if (setParts.length === 0) return;
    
    values.push(id);
    const query = `UPDATE analyses SET ${setParts.join(', ')} WHERE id = $${values.length}`;
    
    await sql(query, values);
  } catch (error) {
    log(`Database error updating analysis: ${error instanceof Error ? error.message : 'Unknown error'}`, 'db');
    throw error;
  }
}

async function getAllAnalyses() {
  try {
    const analyses = await sql`
      SELECT a.*, s.url, s.domain 
      FROM analyses a 
      JOIN sites s ON a.site_id = s.id 
      ORDER BY a.created_at DESC
    `;
    return analyses;
  } catch (error) {
    log(`Database error getting analyses: ${error instanceof Error ? error.message : 'Unknown error'}`, 'db');
    throw error;
  }
}

// SEO Analysis function
async function analyzeUrl(url: string, analysisId: string): Promise<void> {
  try {
    log(`Starting SEO analysis for: ${url}`, 'seo');
    
    // Update status to running
    await updateAnalysis(analysisId, {
      status: "running",
      progress: 10,
      status_message: "Starting PageSpeed analysis..."
    });

    if (!GOOGLE_API_KEY) {
      throw new Error("Google PageSpeed Insights API key not configured");
    }

    // Call Google PageSpeed Insights API
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${GOOGLE_API_KEY}&category=performance&category=accessibility&category=best-practices&category=seo`;
    
    await updateAnalysis(analysisId, {
      progress: 30,
      status_message: "Analyzing page speed performance..."
    });

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    await updateAnalysis(analysisId, {
      progress: 60,
      status_message: "Processing SEO recommendations..."
    });

    // Extract metrics
    const categories = data.lighthouseResult?.categories || {};
    const seoScore = Math.round((categories.seo?.score || 0) * 100);
    const pageSpeed = Math.round((categories.performance?.score || 0) * 100);

    // Count issues (simple heuristic)
    const issues = Math.max(0, 5 - Math.floor((seoScore + pageSpeed) / 40));
    
    await updateAnalysis(analysisId, {
      progress: 80,
      status_message: "Saving analysis results..."
    });

    // Update analysis with results
    await updateAnalysis(analysisId, {
      seo_score: seoScore,
      page_speed: pageSpeed,
      issues: issues,
      status: "completed",
      progress: 100,
      status_message: "Analysis completed successfully",
      raw_data: data
    });

    log(`✅ SEO analysis completed for ${url}: SEO ${seoScore}, Speed ${pageSpeed}`, 'seo');

  } catch (error) {
    log(`❌ SEO analysis failed for ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'seo');
    await updateAnalysis(analysisId, {
      status: "failed",
      status_message: error instanceof Error ? error.message : "Unknown error occurred"
    });
    throw error;
  }
}

// Main handler function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  const path = new URL(url || '', 'http://localhost').pathname;
  
  log(`🚀 ${method} ${path}`, "request");

  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Health check
    if (method === 'GET' && path === '/api/analyzer/health') {
      return res.json({
        status: 'healthy',
        database: DATABASE_URL ? 'configured' : 'missing',
        google_api: GOOGLE_API_KEY ? 'configured' : 'missing',
        environment: process.env.VERCEL ? 'vercel' : 'local',
        timestamp: new Date().toISOString()
      });
    }

    // Database test
    if (method === 'GET' && path === '/api/analyzer/test-db') {
      const sites = await getAllSites();
      return res.json({
        status: 'success',
        message: 'Database connection working',
        sites_count: sites.length,
        connection_type: 'HTTP (Neon)'
      });
    }

    // Get all sites
    if (method === 'GET' && path === '/api/analyzer/sites') {
      const sites = await getAllSites();
      return res.json(sites);
    }

    // Create site
    if (method === 'POST' && path === '/api/analyzer/sites') {
      log(`📝 Creating site with data: ${JSON.stringify(req.body)}`, 'sites');
      
      const { url, domain } = validateSiteData(req.body);
      log(`✅ Site data validated: ${url} -> ${domain}`, 'sites');
      
      // Check if site already exists
      const existingSite = await getSiteByUrl(url);
      if (existingSite) {
        log(`ℹ️ Site already exists: ${existingSite.id}`, 'sites');
        return res.json(existingSite);
      }
      
      const site = await createSite(url, domain);
      log(`✅ Site created successfully: ${site.id}`, 'sites');
      
      return res.json(site);
    }

    // Get all analyses
    if (method === 'GET' && path === '/api/analyzer/analyses') {
      const analyses = await getAllAnalyses();
      return res.json(analyses);
    }

    // Create analysis (start SEO analysis)
    if (method === 'POST' && path === '/api/analyzer/analyses') {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: 'URL is required' });
      }

      log(`🔍 Starting analysis for: ${url}`, 'analysis');

      // Validate URL
      if (!isValidUrl(url)) {
        return res.status(400).json({ message: 'Invalid URL format' });
      }

      const domain = new URL(url).hostname;
      
      // Create or get site
      let site = await getSiteByUrl(url);
      if (!site) {
        site = await createSite(url, domain);
        log(`📝 Created new site: ${site.id}`, 'analysis');
      }

      // Create analysis
      const analysis = await createAnalysis(site.id);
      log(`📊 Created analysis: ${analysis.id}`, 'analysis');

      // Start SEO analysis asynchronously
      analyzeUrl(url, analysis.id).catch(error => {
        log(`❌ Async SEO analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'analysis');
      });

      return res.json(analysis);
    }

    // 404 for unknown routes
    return res.status(404).json({ message: 'Route not found' });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log(`❌ Request failed: ${errorMessage}`, 'error');
    
    console.error('Detailed error:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      method,
      path,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({
      message: 'Internal server error',
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    });
  }
}