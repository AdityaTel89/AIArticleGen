import { Router, Request, Response } from 'express';

const router = Router();

// Fixed: Added Promise<void> return type
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;  // Fixed: Added return
  }

  try {
    // Your chat logic here
    res.json({
      response: `Echo: ${message}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

export default router;
