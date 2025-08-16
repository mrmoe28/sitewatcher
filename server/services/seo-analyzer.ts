import { storage } from "../storage";

interface PageSpeedInsightsResult {
  lighthouseResult: {
    categories: {
      performance: { score: number };
      accessibility: { score: number };
      'best-practices': { score: number };
      seo: { score: number };
    };
    audits: Record<string, any>;
  };
}

class SEOAnalyzer {
  private getApiKey(): string {
    return process.env.GOOGLE_PAGESPEED_API_KEY || process.env.GOOGLE_API_KEY || "";
  }

  async analyzeUrl(url: string, analysisId: string): Promise<void> {
    try {
      // Update status to running
      await storage.updateAnalysis(analysisId, {
        status: "running",
        progress: 10,
        statusMessage: "Starting PageSpeed analysis..."
      });

      const apiKey = this.getApiKey();
      if (!apiKey) {
        throw new Error("Google PageSpeed Insights API key not configured");
      }

      // Call Google PageSpeed Insights API
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=performance&category=accessibility&category=best-practices&category=seo`;
      
      await storage.updateAnalysis(analysisId, {
        progress: 30,
        statusMessage: "Analyzing page speed performance..."
      });

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`PageSpeed API error: ${response.status} ${response.statusText}`);
      }

      const data: PageSpeedInsightsResult = await response.json();

      await storage.updateAnalysis(analysisId, {
        progress: 60,
        statusMessage: "Processing SEO recommendations..."
      });

      // Extract metrics
      const categories = data.lighthouseResult.categories;
      const seoScore = Math.round((categories.seo?.score || 0) * 100);
      const pageSpeed = Math.round((categories.performance?.score || 0) * 100);

      // Generate recommendations
      const recommendations = this.generateRecommendations(data.lighthouseResult.audits);
      
      await storage.updateAnalysis(analysisId, {
        progress: 80,
        statusMessage: "Saving analysis results..."
      });

      // Update analysis with results
      await storage.updateAnalysis(analysisId, {
        seoScore,
        pageSpeed,
        issues: recommendations.length,
        status: "completed",
        progress: 100,
        statusMessage: "Analysis completed successfully",
        rawData: data
      });

      // Save recommendations
      for (const rec of recommendations) {
        await storage.createRecommendation({
          analysisId,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          type: rec.type
        });
      }

    } catch (error) {
      console.error("SEO analysis failed:", error);
      await storage.updateAnalysis(analysisId, {
        status: "failed",
        statusMessage: error instanceof Error ? error.message : "Unknown error occurred"
      });
      throw error;
    }
  }

  private generateRecommendations(audits: Record<string, any>) {
    const recommendations = [];

    // Check meta description
    if (audits['meta-description'] && audits['meta-description'].score < 1) {
      recommendations.push({
        title: "Missing Meta Description",
        description: "Add unique meta descriptions to improve click-through rates from search results.",
        priority: "high" as const,
        type: "meta"
      });
    }

    // Check image optimization
    if (audits['unused-images'] && audits['unused-images'].score < 1) {
      recommendations.push({
        title: "Optimize Images",
        description: "Compress images to reduce page load time and improve user experience.",
        priority: "medium" as const,
        type: "images"
      });
    }

    // Check for largest contentful paint
    if (audits['largest-contentful-paint'] && audits['largest-contentful-paint'].score < 0.9) {
      recommendations.push({
        title: "Improve Largest Contentful Paint",
        description: "Optimize loading of the largest content element to improve perceived page speed.",
        priority: "high" as const,
        type: "speed"
      });
    }

    // Check for structured data
    if (audits['structured-data'] && audits['structured-data'].score < 1) {
      recommendations.push({
        title: "Add Schema Markup",
        description: "Implement structured data to help search engines better understand your content.",
        priority: "low" as const,
        type: "schema"
      });
    }

    // Check heading structure
    if (audits['heading-order'] && audits['heading-order'].score < 1) {
      recommendations.push({
        title: "Fix Heading Structure",
        description: "Use proper heading hierarchy (H1, H2, H3) to improve content structure and SEO.",
        priority: "medium" as const,
        type: "content"
      });
    }

    // Check for HTTPS
    if (audits['is-on-https'] && audits['is-on-https'].score < 1) {
      recommendations.push({
        title: "Enable HTTPS",
        description: "Secure your website with HTTPS to improve SEO rankings and user trust.",
        priority: "high" as const,
        type: "security"
      });
    }

    return recommendations;
  }
}

export const seoAnalyzer = new SEOAnalyzer();
