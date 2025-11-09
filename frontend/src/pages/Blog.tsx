import { useEffect, useState } from 'react';
import { fetchArticles } from '../api/articleApi';

interface Article {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function Blog() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const response = await fetchArticles();
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading articles...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog Articles</h1>
      
      {articles.length === 0 ? (
        <p className="text-gray-600 text-center">No articles yet. Generate your first article!</p>
      ) : (
        <div className="grid gap-6">
          {articles.map((article) => (
            <article key={article.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {article.title}
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {article.content}
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Published: {new Date(article.created_at).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <a href="/" className="text-blue-600 hover:underline">
          ← Generate New Article
        </a>
      </div>
    </div>
  );
}
