import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import { getDatabase } from './db/database.js';
import { CrmService } from './services/crm-service.js';
import { ProjectService } from './services/project-service.js';
import { PlaygroundService } from './services/playground-service.js';
import { ZohoOAuthService } from './services/zoho-oauth-service.js';
import { PreviewService } from './services/preview-service.js';
import { AiService } from './services/ai-service.js';

import { createCrmRouter } from './routes/crm-routes.js';
import { createProjectRouter } from './routes/project-routes.js';
import { createPlaygroundRouter, createMockWildcardRouter } from './routes/playground-routes.js';
import { createZohoRouter } from './routes/zoho-routes.js';
import { createPreviewRouter } from './routes/preview-routes.js';
import { createAiRouter } from './routes/ai-routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(dbInstance?: any) {
  const db = dbInstance || getDatabase();
  const crmService = new CrmService(db);
  const projectService = new ProjectService(db);
  const playgroundService = new PlaygroundService(db);
  const zohoOAuthService = new ZohoOAuthService(db);
  const previewService = new PreviewService(projectService);
  const aiService = new AiService(db);

  const app = express();

  // Basic CORS configuration
  app.use(cors());

  // Support JSON and large payloads for project uploads
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Security Headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Zoho CRM Widget Studio Server',
      timestamp: new Date().toISOString()
    });
  });

  // SDK Simulator and Preview Routes
  app.use(createPreviewRouter(previewService));

  // Core API Routers
  app.use('/api/crm', createCrmRouter(crmService));
  app.use('/api/projects', createProjectRouter(projectService));
  app.use('/api/playground', createPlaygroundRouter(playgroundService));
  app.use('/api/zoho', createZohoRouter(zohoOAuthService));
  app.use('/api/ai', createAiRouter(aiService));

  // Direct Mock Wildcard Router (e.g. GET /api/v1/weather/forecast)
  app.use(createMockWildcardRouter(playgroundService));

  // Serve static client assets in production if built
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/preview') || req.path.startsWith('/sdk')) {
        return next();
      }
      res.sendFile(path.resolve(clientDistPath, 'index.html'));
    });
  }

  // Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      code: err.code
    });
  });

  return {
    app,
    db,
    crmService,
    projectService,
    playgroundService,
    zohoOAuthService,
    previewService,
    aiService
  };
}

const isDirectRun = (process.argv[1] && (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('index.ts'))) && !process.env.VITEST;
if (isDirectRun && process.env.NODE_ENV !== 'test') {
  const PORT = parseInt(process.env.PORT || '3001', 10);
  const HOST = process.env.HOST || '127.0.0.1';

  const { app } = createApp();
  app.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`🚀 Zoho CRM Widget Studio Server running on:`);
    console.log(`   http://${HOST}:${PORT}`);
    console.log(`====================================================`);
  });
}
