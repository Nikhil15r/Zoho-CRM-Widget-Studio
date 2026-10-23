import { Router, Request, Response } from 'express';
import { ZohoOAuthService } from '../services/zoho-oauth-service.js';

export function createZohoRouter(zohoService: ZohoOAuthService): Router {
  const router = Router();

  router.get('/config', (req: Request, res: Response) => {
    try {
      res.json(zohoService.getPublicConfig());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/config', (req: Request, res: Response) => {
    try {
      const saved = zohoService.saveConfig(req.body);
      res.json(saved);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/disconnect', (req: Request, res: Response) => {
    try {
      const config = zohoService.disconnect();
      res.json({ message: 'Disconnected from real Zoho CRM account', config });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/test', async (req: Request, res: Response) => {
    try {
      const result = await zohoService.testConnection();
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/proxy', async (req: Request, res: Response) => {
    try {
      const { entity, method, params } = req.body;
      if (!entity || !method) {
        return res.status(400).json({ error: 'Parameters "entity" and "method" are required.' });
      }

      const response = await zohoService.proxyApiCall(entity, method, params || {});
      res.json(response);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
