import { Router, Request, Response } from 'express';
import { AiService } from '../services/ai-service.js';

export function createAiRouter(aiService: AiService): Router {
  const router = Router();

  // Get current AI configuration (without exposing secrets)
  router.get('/config', (req: Request, res: Response) => {
    try {
      const config = aiService.getPublicConfig();
      res.json({ success: true, data: config });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update AI configuration (provider, model, API keys, custom endpoints)
  router.post('/config', (req: Request, res: Response) => {
    try {
      const updated = aiService.saveConfig(req.body);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Chat with AI assistant / copilot
  router.post('/chat', async (req: Request, res: Response) => {
    try {
      const { messages, context, providerOverride } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ success: false, error: 'Messages array is required' });
      }

      const responseMessage = await aiService.chat({
        messages,
        context,
        providerOverride
      });

      res.json({ success: true, data: responseMessage });
    } catch (err: any) {
      console.error('AI chat error:', err);
      res.status(500).json({
        success: false,
        error: err.response?.data?.error?.message || err.message || 'AI request failed'
      });
    }
  });

  // Execute quick AI action (explain, fix, refactor, generate_component, generate_tests, optimize)
  router.post('/action', async (req: Request, res: Response) => {
    try {
      const { action, prompt, context } = req.body;
      if (!action) {
        return res.status(400).json({ success: false, error: 'Action type is required' });
      }

      const responseMessage = await aiService.executeQuickAction({
        action,
        prompt,
        context: context || {}
      });

      res.json({ success: true, data: responseMessage });
    } catch (err: any) {
      console.error('AI quick action error:', err);
      res.status(500).json({
        success: false,
        error: err.response?.data?.error?.message || err.message || 'AI quick action failed'
      });
    }
  });

  return router;
}
