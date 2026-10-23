import { Router, Request, Response } from 'express';
import { PreviewService } from '../services/preview-service.js';

export function createPreviewRouter(previewService: PreviewService): Router {
  const router = Router();

  // SDK Simulator file endpoints
  const serveSdk = (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(previewService.getSdkScript());
  };

  router.get('/sdk/ZohoEmbededAppSDK.js', serveSdk);
  router.get('/js-sdk/:version/ZohoEmbededAppSDK.min.js', serveSdk);

  // Preview file server for projects
  router.get('/preview/:projectId/*', (req: Request, res: Response) => {
    const projectId = req.params.projectId;
    // Extract everything after /preview/:projectId/
    const assetPath = req.params[0] || '';

    const asset = previewService.getProjectAsset(projectId, assetPath);
    if (!asset) {
      return res.status(404).send(`Asset "${assetPath}" not found in project "${projectId}".`);
    }

    res.setHeader('Content-Type', asset.mimeType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // Controlled sandbox headers
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http:; object-src 'none';"
    );

    res.send(asset.content);
  });

  return router;
}
