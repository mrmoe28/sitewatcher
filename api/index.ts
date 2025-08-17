import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { log } from "../server/vite";

let app: express.Application | null = null;

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

    // Register API routes
    await registerRoutes(app);

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
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}