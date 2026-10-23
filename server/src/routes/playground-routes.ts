import { Router, Request, Response } from 'express';
import { PlaygroundService } from '../services/playground-service.js';

export function createPlaygroundRouter(playgroundService: PlaygroundService): Router {
  const router = Router();

  // Mock Endpoints CRUD
  router.get('/endpoints', (req: Request, res: Response) => {
    try {
      res.json(playgroundService.getMockEndpoints());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/endpoints', (req: Request, res: Response) => {
    try {
      const created = playgroundService.createMockEndpoint(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.put('/endpoints/:id', (req: Request, res: Response) => {
    try {
      const updated = playgroundService.updateMockEndpoint(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  router.delete('/endpoints/:id', (req: Request, res: Response) => {
    try {
      playgroundService.deleteMockEndpoint(req.params.id);
      res.json({ message: 'Mock endpoint deleted successfully' });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // Saved Test Profiles CRUD
  router.get('/profiles', (req: Request, res: Response) => {
    try {
      res.json(playgroundService.getTestProfiles());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/profiles', (req: Request, res: Response) => {
    try {
      const saved = playgroundService.saveTestProfile(req.body);
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/profiles/:id', (req: Request, res: Response) => {
    try {
      playgroundService.deleteTestProfile(req.params.id);
      res.json({ message: 'Test profile deleted' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Request Executor (used by Playground UI and widget preview runtime)
  router.post('/execute', async (req: Request, res: Response) => {
    try {
      const { method, url, headers, queryParams, body } = req.body;
      if (!method || !url) {
        return res.status(400).json({ error: 'Parameters "method" and "url" are required.' });
      }

      const log = await playgroundService.executeRequest({
        method: method.toUpperCase(),
        url,
        headers,
        queryParams,
        body
      });

      res.json(log);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

/**
 * Wildcard router that directly serves mock endpoint URLs matching registered paths
 * e.g. GET /api/v1/weather/forecast
 */
export function createMockWildcardRouter(playgroundService: PlaygroundService): Router {
  const router = Router();

  router.all('*', async (req: Request, res: Response, next) => {
    const fullPath = req.originalUrl.split('?')[0];
    const match = playgroundService.findMockResponse(req.method, fullPath);

    if (match) {
      if (match.latencyMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, match.latencyMs));
      }

      // Set custom headers
      for (const [k, v] of Object.entries(match.responseHeaders)) {
        res.setHeader(k, v);
      }

      res.status(match.statusCode);

      // Return body
      try {
        const parsed = JSON.parse(match.responseBody);
        return res.json(parsed);
      } catch {
        return res.send(match.responseBody);
      }
    }

    next();
  });

  return router;
}
