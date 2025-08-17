import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

console.log("🔧 Environment check:", {
  DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
  GOOGLE_PAGESPEED_API_KEY: process.env.GOOGLE_PAGESPEED_API_KEY ? "✅ Set" : "❌ Missing",
  VERCEL: process.env.VERCEL ? "✅ Vercel environment" : "❌ Local environment",
  NODE_ENV: process.env.NODE_ENV || "undefined"
});

import express, { type Request, Response, NextFunction } from "express";
import { z } from "zod";

// All modules are now loaded individually within each route handler for better error isolation

let app: express.Application | null = null;

// Simple logging function for serverless environment
function log(message: string, source = "api") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

async function registerApiRoutes(app: express.Application): Promise<void> {
  // Health check endpoint - test basic functionality
  app.get("/api/health", async (req, res) => {
    try {
      // Test database import and connection
      const { getDatabase } = await import("../server/db");
      const db = getDatabase();
      
      res.json({ 
        status: "healthy", 
        database: "connected",
        environment: process.env.VERCEL ? "vercel" : "local",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({ 
        status: "unhealthy", 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      });
    }
  });

  // Simple test endpoint for analysis functionality
  app.post("/api/test-analysis", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      log(`Testing analysis for URL: ${url}`, "test");
      
      // Test URL parsing
      try {
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname;
        log(`✅ URL parsed successfully: ${domain}`, "test");
      } catch (urlError) {
        return res.status(400).json({ 
          message: "Invalid URL", 
          error: urlError instanceof Error ? urlError.message : "URL parsing failed" 
        });
      }

      // Test database access
      try {
        const { storage } = await import("../server/storage");
        const sites = await storage.getAllSites();
        log(`✅ Database accessed successfully, found ${sites.length} sites`, "test");
      } catch (dbError) {
        return res.status(500).json({ 
          message: "Database access failed", 
          error: dbError instanceof Error ? dbError.message : "Database error" 
        });
      }

      // Test Google API key
      const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          message: "Google API key not configured",
          env_check: {
            GOOGLE_PAGESPEED_API_KEY: !!process.env.GOOGLE_PAGESPEED_API_KEY,
            GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY
          }
        });
      }

      res.json({ 
        status: "success", 
        message: "All analysis components working",
        url_domain: new URL(url).hostname,
        api_key_configured: true,
        database_accessible: true
      });

    } catch (error) {
      console.error("Test analysis failed:", error);
      res.status(500).json({ 
        message: "Test analysis failed", 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      });
    }
  });

  // Test Google PageSpeed API directly
  app.post("/api/test-pagespeed", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Google API key not configured" });
      }

      log(`Testing PageSpeed API for: ${url}`, "pagespeed");
      
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=seo`;
      
      log(`API URL: ${apiUrl.substring(0, 100)}...`, "pagespeed");
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        log(`❌ PageSpeed API error: ${response.status} ${response.statusText}`, "pagespeed");
        return res.status(response.status).json({ 
          message: "PageSpeed API error", 
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
      }

      const data = await response.json();
      log(`✅ PageSpeed API success`, "pagespeed");
      
      res.json({ 
        status: "success", 
        message: "PageSpeed API working",
        seo_score: data.lighthouseResult?.categories?.seo?.score || 0,
        has_lighthouse_data: !!data.lighthouseResult
      });

    } catch (error) {
      console.error("PageSpeed API test failed:", error);
      res.status(500).json({ 
        message: "PageSpeed API test failed", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Sites endpoints
  app.get("/api/sites", async (req, res) => {
    try {
      const { storage } = await import("../server/storage");
      const sites = await storage.getAllSites();
      res.json(sites);
    } catch (error) {
      console.error("Error fetching sites:", error);
      res.status(500).json({ message: "Failed to fetch sites" });
    }
  });

  app.post("/api/sites", async (req, res) => {
    try {
      const { storage } = await import("../server/storage");
      const { insertSiteSchema } = await import("../shared/schema");
      const siteData = insertSiteSchema.parse(req.body);
      const site = await storage.createSite(siteData);
      res.json(site);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid site data", errors: error.errors });
      } else {
        console.error("Error creating site:", error);
        res.status(500).json({ message: "Failed to create site" });
      }
    }
  });

  app.get("/api/sites/:id", async (req, res) => {
    try {
      const site = await storage.getSiteById(req.params.id);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      console.error("Error fetching site:", error);
      res.status(500).json({ message: "Failed to fetch site" });
    }
  });

  app.put("/api/sites/:id", async (req, res) => {
    try {
      const siteData = insertSiteSchema.partial().parse(req.body);
      const site = await storage.updateSite(req.params.id, siteData);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid site data", errors: error.errors });
      } else {
        console.error("Error updating site:", error);
        res.status(500).json({ message: "Failed to update site" });
      }
    }
  });

  app.delete("/api/sites/:id", async (req, res) => {
    try {
      await storage.deleteSite(req.params.id);
      res.json({ message: "Site deleted successfully" });
    } catch (error) {
      console.error("Error deleting site:", error);
      res.status(500).json({ message: "Failed to delete site" });
    }
  });

  // Analysis endpoints
  app.get("/api/analyses", async (req, res) => {
    try {
      const { storage } = await import("../server/storage");
      const analyses = await storage.getAllAnalyses();
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      res.status(500).json({ message: "Failed to fetch analyses" });
    }
  });

  app.post("/api/analyses", async (req, res) => {
    try {
      const { storage } = await import("../server/storage");
      const { seoAnalyzer } = await import("../server/services/seo-analyzer");
      
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      // Extract domain from URL
      const domain = new URL(url).hostname;
      
      // Create or get site
      let site = await storage.getSiteByUrl(url);
      if (!site) {
        site = await storage.createSite({ url, domain });
      }

      // Create analysis
      const analysis = await storage.createAnalysis({
        siteId: site.id,
        status: "pending",
        progress: 0,
        statusMessage: "Analysis queued"
      });

      // Start SEO analysis asynchronously
      seoAnalyzer.analyzeUrl(url, analysis.id).catch(error => {
        console.error("SEO analysis failed:", error);
        storage.updateAnalysis(analysis.id, {
          status: "failed",
          statusMessage: "Analysis failed: " + error.message
        });
      });

      res.json(analysis);
    } catch (error) {
      console.error("Error starting analysis:", error);
      res.status(500).json({ message: "Failed to start analysis" });
    }
  });

  app.get("/api/analyses/:id", async (req, res) => {
    try {
      const analysis = await storage.getAnalysisById(req.params.id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      res.status(500).json({ message: "Failed to fetch analysis" });
    }
  });

  app.delete("/api/analyses/:id", async (req, res) => {
    try {
      const analysis = await storage.getAnalysisById(req.params.id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      await storage.deleteAnalysis(req.params.id);
      res.json({ message: "Analysis deleted successfully" });
    } catch (error) {
      console.error("Error deleting analysis:", error);
      res.status(500).json({ message: "Failed to delete analysis" });
    }
  });

  // Recommendations endpoints
  app.get("/api/analyses/:analysisId/recommendations", async (req, res) => {
    try {
      const recommendations = await storage.getRecommendationsByAnalysisId(req.params.analysisId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Keywords endpoints
  app.get("/api/sites/:siteId/keywords", async (req, res) => {
    try {
      const keywords = await storage.getKeywordsBySiteId(req.params.siteId);
      res.json(keywords);
    } catch (error) {
      console.error("Error fetching keywords:", error);
      res.status(500).json({ message: "Failed to fetch keywords" });
    }
  });

  // Dashboard metrics endpoint
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics", async (req, res) => {
    try {
      const { site, timeRange = "30d" } = req.query;
      const analytics = await storage.getAnalyticsData(site as string, timeRange as string);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/trends", async (req, res) => {
    try {
      const { site, timeRange = "30d" } = req.query;
      const trends = await storage.getAnalyticsTrends(site as string, timeRange as string);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching analytics trends:", error);
      res.status(500).json({ message: "Failed to fetch analytics trends" });
    }
  });

  app.get("/api/analytics/comparison", async (req, res) => {
    try {
      const comparison = await storage.getSiteComparison();
      res.json(comparison);
    } catch (error) {
      console.error("Error fetching site comparison:", error);
      res.status(500).json({ message: "Failed to fetch site comparison" });
    }
  });
}

async function getApp() {
  if (!app) {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Add logging middleware
    app.use((req, res, next) => {
      const start = Date.now();
      const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined = undefined;

      const originalResJson = res.json;
      res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };

      res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }

          if (logLine.length > 80) {
            logLine = logLine.slice(0, 79) + "…";
          }

          log(logLine);
        }
      });

      next();
    });

    // Register API routes (without creating HTTP server)
    await registerApiRoutes(app);

    // Error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Server error:", err);
      res.status(status).json({ message });
    });
  }
  
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    log(`🚀 Handler starting: ${req.method} ${req.url}`, "vercel");
    
    // Test environment variables first
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL not set");
      return res.status(500).json({ 
        message: "Database configuration missing",
        missing_env: "DATABASE_URL"
      });
    }

    // Database connections are handled within individual route handlers
    
    const app = await getApp();
    log(`✅ Express app ready`, "vercel");
    
    return app(req, res);
  } catch (error) {
    console.error("❌ Handler error:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}