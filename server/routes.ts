import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seoAnalyzer } from "./services/seo-analyzer";
import { insertSiteSchema, insertAnalysisSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sites endpoints
  app.get("/api/sites", async (req, res) => {
    try {
      const sites = await storage.getAllSites();
      res.json(sites);
    } catch (error) {
      console.error("Error fetching sites:", error);
      res.status(500).json({ message: "Failed to fetch sites" });
    }
  });

  app.post("/api/sites", async (req, res) => {
    try {
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

  // Analysis endpoints
  app.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAllAnalyses();
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      res.status(500).json({ message: "Failed to fetch analyses" });
    }
  });

  app.post("/api/analyses", async (req, res) => {
    try {
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

  const httpServer = createServer(app);
  return httpServer;
}
