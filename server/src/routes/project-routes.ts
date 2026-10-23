import { Router, Request, Response } from 'express';
import { ProjectService } from '../services/project-service.js';

export function createProjectRouter(projectService: ProjectService): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    try {
      const projects = projectService.getProjects();
      res.json(projects);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/', (req: Request, res: Response) => {
    try {
      const project = projectService.createProject(req.body);
      res.status(201).json(project);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/:id', (req: Request, res: Response) => {
    try {
      const project = projectService.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: `Project "${req.params.id}" not found` });
      }
      res.json(project);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/:id', (req: Request, res: Response) => {
    try {
      const updated = projectService.updateProjectManifest(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/:id/duplicate', (req: Request, res: Response) => {
    try {
      const duplicated = projectService.duplicateProject(req.params.id, req.body.name);
      res.status(201).json(duplicated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/:id', (req: Request, res: Response) => {
    try {
      projectService.deleteProject(req.params.id);
      res.json({ message: 'Project deleted successfully' });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  router.post('/:id/files', (req: Request, res: Response) => {
    try {
      const saved = projectService.saveFile(req.params.id, req.body);
      res.json(saved);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/:id/files', (req: Request, res: Response) => {
    try {
      const filePath = req.query.path as string;
      if (!filePath) {
        return res.status(400).json({ error: 'Query parameter "path" is required' });
      }
      projectService.deleteFile(req.params.id, filePath);
      res.json({ message: `File "${filePath}" deleted successfully` });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/:id/export', async (req: Request, res: Response) => {
    try {
      const project = projectService.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const zipBuffer = await projectService.exportZip(req.params.id);
      const safeFilename = `${project.manifest.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.zip`;

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
      res.send(zipBuffer);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/import', async (req: Request, res: Response) => {
    try {
      let buffer: Buffer;

      if (req.body && req.body.base64Zip) {
        buffer = Buffer.from(req.body.base64Zip, 'base64');
      } else if (Buffer.isBuffer(req.body)) {
        buffer = req.body;
      } else {
        return res.status(400).json({ error: 'Please provide base64Zip string in body or raw zip buffer.' });
      }

      const overrideName = req.query.name as string | undefined;
      const imported = await projectService.importZip(buffer, overrideName);
      res.status(201).json(imported);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}
