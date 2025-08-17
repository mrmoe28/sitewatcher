import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000', 'http://127.0.0.1:3002'],
  credentials: true
}));
app.use(express.json());

// Enhanced logging
function log(message, source = "server") {
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${timestamp} [${source}] ${message}`);
}

// Validation helpers
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Database operations
async function getAllSites() {
  try {
    const sites = await sql`SELECT * FROM sites ORDER BY created_at DESC`;
    return sites;
  } catch (error) {
    log(`Database error getting sites: ${error.message}`, 'db');
    throw error;
  }
}

async function createSite(url, domain) {
  try {
    const [site] = await sql`
      INSERT INTO sites (url, domain) 
      VALUES (${url}, ${domain}) 
      RETURNING *
    `;
    return site;
  } catch (error) {
    log(`Database error creating site: ${error.message}`, 'db');
    throw error;
  }
}

async function getSiteByUrl(url) {
  try {
    const [site] = await sql`SELECT * FROM sites WHERE url = ${url}`;
    return site || null;
  } catch (error) {
    log(`Database error getting site by URL: ${error.message}`, 'db');
    throw error;
  }
}

async function createAnalysis(siteId, status = 'pending', progress = 0, statusMessage = 'Analysis queued') {
  try {
    const [analysis] = await sql`
      INSERT INTO analyses (site_id, status, progress, status_message) 
      VALUES (${siteId}, ${status}, ${progress}, ${statusMessage}) 
      RETURNING *
    `;
    return analysis;
  } catch (error) {
    log(`Database error creating analysis: ${error.message}`, 'db');
    throw error;
  }
}

async function updateAnalysis(id, updates) {
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
    if (updates.statusMessage !== undefined) {
      setParts.push(`status_message = $${values.length + 1}`);
      values.push(updates.statusMessage);
    }
    if (updates.seoScore !== undefined) {
      setParts.push(`seo_score = $${values.length + 1}`);
      values.push(updates.seoScore);
    }
    if (updates.pageSpeed !== undefined) {
      setParts.push(`page_speed = $${values.length + 1}`);
      values.push(updates.pageSpeed);
    }
    if (updates.issues !== undefined) {
      setParts.push(`issues = $${values.length + 1}`);
      values.push(updates.issues);
    }
    if (updates.rawData !== undefined) {
      setParts.push(`raw_data = $${values.length + 1}`);
      values.push(JSON.stringify(updates.rawData));
    }
    
    if (setParts.length === 0) return;
    
    values.push(id);
    const query = `UPDATE analyses SET ${setParts.join(', ')} WHERE id = $${values.length}`;
    
    await sql(query, values);
  } catch (error) {
    log(`Database error updating analysis: ${error.message}`, 'db');
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
    log(`Database error getting analyses: ${error.message}`, 'db');
    throw error;
  }
}

// SEO Analysis function
async function analyzeUrl(url, analysisId) {
  try {
    log(`🔍 Starting SEO analysis for: ${url}`, 'seo');
    
    // Update status to running
    await updateAnalysis(analysisId, {
      status: "running",
      progress: 10,
      statusMessage: "Starting PageSpeed analysis..."
    });

    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
    if (!apiKey) {
      throw new Error("Google PageSpeed Insights API key not configured");
    }

    // Call Google PageSpeed Insights API
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=performance&category=accessibility&category=best-practices&category=seo`;
    
    log(`📡 Calling PageSpeed API...`, 'seo');
    await updateAnalysis(analysisId, {
      progress: 30,
      statusMessage: "Analyzing page speed performance..."
    });

    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PageSpeed API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    log(`✅ PageSpeed API response received`, 'seo');

    await updateAnalysis(analysisId, {
      progress: 60,
      statusMessage: "Processing SEO recommendations..."
    });

    // Extract metrics
    const categories = data.lighthouseResult?.categories || {};
    const seoScore = Math.round((categories.seo?.score || 0) * 100);
    const pageSpeed = Math.round((categories.performance?.score || 0) * 100);
    const accessibility = Math.round((categories.accessibility?.score || 0) * 100);
    const bestPractices = Math.round((categories['best-practices']?.score || 0) * 100);

    // Count issues (simple heuristic)
    const issues = Math.max(0, 5 - Math.floor((seoScore + pageSpeed) / 40));
    
    await updateAnalysis(analysisId, {
      progress: 80,
      statusMessage: "Saving analysis results..."
    });

    // Update analysis with results
    await updateAnalysis(analysisId, {
      seoScore: seoScore,
      pageSpeed: pageSpeed,
      issues: issues,
      status: "completed",
      progress: 100,
      statusMessage: "Analysis completed successfully",
      rawData: data
    });

    log(`✅ SEO analysis completed for ${url}:`, 'seo');
    log(`   SEO Score: ${seoScore}`, 'seo');
    log(`   Page Speed: ${pageSpeed}`, 'seo');
    log(`   Accessibility: ${accessibility}`, 'seo');
    log(`   Best Practices: ${bestPractices}`, 'seo');
    log(`   Issues Found: ${issues}`, 'seo');

  } catch (error) {
    log(`❌ SEO analysis failed for ${url}: ${error.message}`, 'seo');
    console.error('Full error:', error);
    await updateAnalysis(analysisId, {
      status: "failed",
      statusMessage: error.message
    });
    throw error;
  }
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  log(`GET /health`, 'api');
  res.json({
    status: 'healthy',
    database: process.env.DATABASE_URL ? 'configured' : 'missing',
    google_api: process.env.GOOGLE_PAGESPEED_API_KEY ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  });
});

// Database test
app.get('/test-db', async (req, res) => {
  try {
    log(`GET /test-db`, 'api');
    const sites = await getAllSites();
    log(`✅ Database test successful - found ${sites.length} sites`, 'db');
    res.json({
      status: 'success',
      message: 'Database connection working',
      sites_count: sites.length,
      connection_type: 'HTTP (Neon)'
    });
  } catch (error) {
    log(`❌ Database test failed: ${error.message}`, 'db');
    res.status(500).json({
      status: 'failed',
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Get all sites
app.get('/sites', async (req, res) => {
  try {
    log(`GET /sites`, 'api');
    const sites = await getAllSites();
    log(`✅ Retrieved ${sites.length} sites`, 'api');
    res.json(sites);
  } catch (error) {
    log(`❌ Error fetching sites: ${error.message}`, 'api');
    res.status(500).json({ message: 'Failed to fetch sites', error: error.message });
  }
});

// Create site
app.post('/sites', async (req, res) => {
  try {
    const { url, domain } = req.body;
    log(`POST /sites - Creating site: ${url}`, 'api');
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: 'URL is required and must be a string' });
    }
    
    if (!isValidUrl(url)) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }
    
    const siteDomain = domain || new URL(url).hostname;
    log(`   Domain: ${siteDomain}`, 'api');
    
    // Check if site already exists
    const existingSite = await getSiteByUrl(url);
    if (existingSite) {
      log(`   Site already exists: ${existingSite.id}`, 'api');
      return res.json(existingSite);
    }
    
    const site = await createSite(url, siteDomain);
    log(`✅ Site created successfully: ${site.id}`, 'api');
    
    res.json(site);
  } catch (error) {
    log(`❌ Error creating site: ${error.message}`, 'api');
    console.error('Full error:', error);
    res.status(500).json({ 
      message: 'Failed to create site', 
      error: error.message,
      stack: error.stack
    });
  }
});

// Get all analyses
app.get('/analyses', async (req, res) => {
  try {
    log(`GET /analyses`, 'api');
    const analyses = await getAllAnalyses();
    log(`✅ Retrieved ${analyses.length} analyses`, 'api');
    res.json(analyses);
  } catch (error) {
    log(`❌ Error fetching analyses: ${error.message}`, 'api');
    res.status(500).json({ message: 'Failed to fetch analyses', error: error.message });
  }
});

// Create analysis (start SEO analysis)
app.post('/analyses', async (req, res) => {
  try {
    const { url } = req.body;
    log(`POST /analyses - Starting analysis for: ${url}`, 'api');
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: 'URL is required' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    const domain = new URL(url).hostname;
    
    // Create or get site
    let site = await getSiteByUrl(url);
    if (!site) {
      site = await createSite(url, domain);
      log(`   Created new site: ${site.id}`, 'api');
    } else {
      log(`   Using existing site: ${site.id}`, 'api');
    }

    // Create analysis
    const analysis = await createAnalysis(site.id);
    log(`   Created analysis: ${analysis.id}`, 'api');

    // Start SEO analysis asynchronously
    analyzeUrl(url, analysis.id).catch(error => {
      log(`❌ Async SEO analysis failed: ${error.message}`, 'error');
    });

    res.json(analysis);
  } catch (error) {
    log(`❌ Error creating analysis: ${error.message}`, 'api');
    console.error('Full error:', error);
    res.status(500).json({ 
      message: 'Failed to create analysis', 
      error: error.message,
      stack: error.stack
    });
  }
});

// Start server
app.listen(PORT, () => {
  log(`🚀 SiteWatcher Local Server running on http://localhost:${PORT}`, 'server');
  log(`📊 Health check: http://localhost:${PORT}/health`, 'server');
  log(`🧪 Database test: http://localhost:${PORT}/test-db`, 'server');
  log(``, 'server');
  log(`🔧 Environment:`, 'server');
  log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configured' : '❌ Missing'}`, 'server');
  log(`   GOOGLE_API_KEY: ${process.env.GOOGLE_PAGESPEED_API_KEY ? '✅ Configured' : '❌ Missing'}`, 'server');
});