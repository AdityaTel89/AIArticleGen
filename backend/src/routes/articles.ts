import { Router, Request, Response } from 'express';
import { createArticle, getAllArticles } from '../models/article';
import { generateArticleContent } from '../services/aiService';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const articles = await getAllArticles();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

router.post('/generate', async (req: Request, res: Response) => {
  const { title, details } = req.body;
  console.log('Article generate request received', { title, details });

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const content = await generateArticleContent(title, details);
    const article = await createArticle(title, content);
    res.json(article);
  } catch (error) {
    console.error('Article generation error:', error);
    res.status(500).json({ error: 'Failed to generate article' });
  }
});

export default router;
