import { Router, Request, Response } from 'express';
import { CrmService } from '../services/crm-service.js';

export function createCrmRouter(crmService: CrmService): Router {
  const router = Router();

  router.get('/modules', (req: Request, res: Response) => {
    try {
      const modules = crmService.getModules();
      res.json(modules);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/modules/:name', (req: Request, res: Response) => {
    try {
      const mod = crmService.getModule(req.params.name);
      if (!mod) {
        return res.status(404).json({ error: `Module "${req.params.name}" not found` });
      }
      res.json(mod);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/modules', (req: Request, res: Response) => {
    try {
      const created = crmService.createCustomModule(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.put('/modules/:name/fields', (req: Request, res: Response) => {
    try {
      const updated = crmService.updateModuleFields(req.params.name, req.body.fields);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/records/:entity', (req: Request, res: Response) => {
    try {
      const result = crmService.getRecords(req.params.entity, {
        page: req.query.page ? Number(req.query.page) : undefined,
        per_page: req.query.per_page ? Number(req.query.per_page) : undefined,
        sort_order: (req.query.sort_order as any) || 'desc'
      });
      res.json(result);
    } catch (err: any) {
      res.status(err.code === 'INVALID_MODULE' ? 404 : 500).json(err);
    }
  });

  router.get('/records/:entity/:id', (req: Request, res: Response) => {
    try {
      const result = crmService.getRecord(req.params.entity, req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(err.code === 'RECORD_NOT_FOUND' ? 404 : 400).json(err);
    }
  });

  router.post('/records/:entity', (req: Request, res: Response) => {
    try {
      const result = crmService.insertRecord(req.params.entity, req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(err.code === 'MANDATORY_NOT_FOUND' ? 400 : 500).json(err);
    }
  });

  router.put('/records/:entity', (req: Request, res: Response) => {
    try {
      const result = crmService.updateRecord(req.params.entity, req.body);
      res.json(result);
    } catch (err: any) {
      res.status(err.code === 'RECORD_NOT_FOUND' ? 404 : 400).json(err);
    }
  });

  router.delete('/records/:entity/:id', (req: Request, res: Response) => {
    try {
      const result = crmService.deleteRecord(req.params.entity, req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(err.code === 'RECORD_NOT_FOUND' ? 404 : 400).json(err);
    }
  });

  router.post('/search', (req: Request, res: Response) => {
    try {
      const { entity, type, query, page, per_page } = req.body;
      const result = crmService.searchRecords(entity, { type, query, page, per_page });
      res.json(result);
    } catch (err: any) {
      res.status(400).json(err);
    }
  });

  router.get('/current-user', (req: Request, res: Response) => {
    try {
      res.json(crmService.getCurrentUser());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/org-info', (req: Request, res: Response) => {
    try {
      res.json(crmService.getOrgInfo());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/reset', (req: Request, res: Response) => {
    try {
      crmService.resetToDemoData();
      res.json({ message: 'Mock CRM data successfully reset to clean demo fixtures.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
