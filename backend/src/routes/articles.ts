import { Router, Request, Response } from 'express';
import {
  createArticle,
  getAllArticles,
  getArticlesByUserId,
  getArticleById,
  deleteArticle,
} from '../models/article';
import { generateArticleContent } from '../services/aiService';
import { authenticateToken } from '../middleware/authMiddleware';
import { getUserById } from '../models/user';

const router = Router();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Fixed: removed unused 'req'
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const articles = await getAllArticles();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Fixed: Added Promise<void> return type
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await getArticleById(parseInt(req.params.id));
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;  // Fixed: Added return
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Fixed: Added Promise<void> return type
router.get('/user/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const articles = await getArticlesByUserId(req.user!.id);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user articles' });
  }
});

// Fixed: Added Promise<void> return type
router.post('/generate', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { title, details } = req.body;

  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;  // Fixed: Added return
  }

  try {
    const user = await getUserById(req.user!.id);
    const content = await generateArticleContent(title, details);
    const article = await createArticle(
      title,
      content,
      req.user!.id,
      user?.name || user?.email
    );
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate article' });
  }
});

// Fixed: Added Promise<void> return type
router.post('/bulk-generate', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { titles, details } = req.body;

  if (!Array.isArray(titles) || titles.length === 0) {
    res.status(400).json({ error: 'Titles must be a non-empty array' });
    return;  // Fixed: Added return
  }

  try {
    const user = await getUserById(req.user!.id);
    const articles = [];

    for (const title of titles) {
      console.log(`Generating article for: ${title}`);
      const content = await generateArticleContent(title, details || '');
      const article = await createArticle(
        title,
        content,
        req.user!.id,
        user?.name || user?.email
      );
      articles.push(article);

      await delay(1500);
    }

    res.json({
      message: `Successfully generated ${articles.length} articles`,
      articles,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate articles' });
  }
});

// Fixed: Added Promise<void> return type
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteArticle(parseInt(req.params.id), req.user!.id);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

export default router;
