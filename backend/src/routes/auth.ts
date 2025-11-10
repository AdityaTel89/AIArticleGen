import { Router, Request, Response } from 'express';
import { signupUser, loginUser } from '../services/authService';

const router = Router();

// Fixed: Added Promise<void> return type
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;  // Fixed: Added return
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;  // Fixed: Added return
  }

  try {
    const authResponse = await signupUser(email, password, name);
    res.json(authResponse);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Fixed: Added Promise<void> return type
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;  // Fixed: Added return
  }

  try {
    const authResponse = await loginUser(email, password);
    res.json(authResponse);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
