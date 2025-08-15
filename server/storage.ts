import { 
  users, 
  sites, 
  analyses, 
  recommendations, 
  keywords,
  type User, 
  type InsertUser,
  type Site,
  type InsertSite,
  type Analysis,
  type InsertAnalysis,
  type Recommendation,
  type InsertRecommendation,
  type Keyword,
  type InsertKeyword
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, avg } from "drizzle-orm";

interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Site methods
  getAllSites(): Promise<Site[]>;
  getSiteByUrl(url: string): Promise<Site | undefined>;
  createSite(insertSite: InsertSite): Promise<Site>;
  
  // Analysis methods
  getAllAnalyses(): Promise<Analysis[]>;
  getAnalysisById(id: string): Promise<Analysis | undefined>;
  createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis>;
  updateAnalysis(id: string, updates: Partial<Analysis>): Promise<void>;
  deleteAnalysis(id: string): Promise<void>;
  
  // Recommendation methods
  getRecommendationsByAnalysisId(analysisId: string): Promise<Recommendation[]>;
  createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation>;
  
  // Keyword methods
  getKeywordsBySiteId(siteId: string): Promise<Keyword[]>;
  createKeyword(insertKeyword: InsertKeyword): Promise<Keyword>;
  
  // Dashboard metrics
  getDashboardMetrics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Site methods
  async getAllSites(): Promise<Site[]> {
    return await db.select().from(sites).orderBy(desc(sites.createdAt));
  }

  async getSiteByUrl(url: string): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.url, url));
    return site || undefined;
  }

  async createSite(insertSite: InsertSite): Promise<Site> {
    const [site] = await db
      .insert(sites)
      .values(insertSite)
      .returning();
    return site;
  }

  // Analysis methods
  async getAllAnalyses(): Promise<Analysis[]> {
    return await db.query.analyses.findMany({
      with: {
        site: true,
      },
      orderBy: desc(analyses.createdAt),
    });
  }

  async getAnalysisById(id: string): Promise<Analysis | undefined> {
    const analysis = await db.query.analyses.findFirst({
      where: eq(analyses.id, id),
      with: {
        site: true,
        recommendations: true,
      },
    });
    return analysis || undefined;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const [analysis] = await db
      .insert(analyses)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async updateAnalysis(id: string, updates: Partial<Analysis>): Promise<void> {
    await db
      .update(analyses)
      .set(updates)
      .where(eq(analyses.id, id));
  }

  async deleteAnalysis(id: string): Promise<void> {
    await db.delete(analyses).where(eq(analyses.id, id));
  }

  // Recommendation methods
  async getRecommendationsByAnalysisId(analysisId: string): Promise<Recommendation[]> {
    return await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.analysisId, analysisId))
      .orderBy(desc(recommendations.createdAt));
  }

  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const [recommendation] = await db
      .insert(recommendations)
      .values(insertRecommendation)
      .returning();
    return recommendation;
  }

  // Keyword methods
  async getKeywordsBySiteId(siteId: string): Promise<Keyword[]> {
    return await db
      .select()
      .from(keywords)
      .where(eq(keywords.siteId, siteId))
      .orderBy(desc(keywords.createdAt));
  }

  async createKeyword(insertKeyword: InsertKeyword): Promise<Keyword> {
    const [keyword] = await db
      .insert(keywords)
      .values(insertKeyword)
      .returning();
    return keyword;
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<any> {
    const [siteCount] = await db.select({ count: count() }).from(sites);
    const [analysisCount] = await db.select({ count: count() }).from(analyses);
    const [avgSeoScore] = await db.select({ avg: avg(analyses.seoScore) }).from(analyses).where(eq(analyses.status, "completed"));
    const [avgPageSpeed] = await db.select({ avg: avg(analyses.pageSpeed) }).from(analyses).where(eq(analyses.status, "completed"));

    return {
      seoScore: Math.round(Number(avgSeoScore?.avg) || 0),
      pageSpeed: Math.round(Number(avgPageSpeed?.avg) || 0),
      sites: siteCount?.count || 0,
      analyses: analysisCount?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();