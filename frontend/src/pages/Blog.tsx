import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '../components/CodeBlock';
import { fetchArticles } from '../api/articleApi';
import {
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  UserCircleIcon,
  DocumentTextIcon, // ✅ Added missing import
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

interface Article {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author_name?: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
}

export default function Blog() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const { user } = useAuth();

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetchArticles();
      setArticles(res.data || []);
    } catch (err: any) {
      console.error('Error loading articles:', err);
      setError(err.response?.data?.error || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const copyArticle = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter articles based on selected tab
  const filteredArticles =
    filter === 'mine' && user
      ? articles.filter((article) => article.user_id === user.id)
      : articles;

  // Count for badges
  const myArticlesCount = articles.filter((article) => article.user_id === user?.id).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-500 dark:text-gray-400">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
        <div className="text-center max-w-md">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
              Error Loading Articles
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
            <button
              onClick={loadArticles}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900 dark:text-white">
            Blog Articles
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-6">
            AI-generated programming articles and tutorials
          </p>

          {/* Filter Tabs with Counts */}
          <div className="flex gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 sm:px-6 py-3 font-semibold transition-colors relative whitespace-nowrap flex items-center gap-2 ${
                filter === 'all'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              All Articles
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                filter === 'all'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {articles.length}
              </span>
              {filter === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
            
            <button
              onClick={() => setFilter('mine')}
              className={`px-4 sm:px-6 py-3 font-semibold transition-colors relative whitespace-nowrap flex items-center gap-2 ${
                filter === 'mine'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              My Articles
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                filter === 'mine'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {myArticlesCount}
              </span>
              {filter === 'mine' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
          </div>
        </div>

        {/* Articles */}
        {filteredArticles.length === 0 ? (
          <div className="py-16 sm:py-24 text-center">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-3xl p-8 sm:p-12 border border-gray-200 dark:border-gray-800">
              <div className="mb-4">
                {filter === 'mine' ? (
                  <UserCircleIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" />
                ) : (
                  <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" />
                )}
              </div>
              <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">
                {filter === 'mine'
                  ? "You haven't created any articles yet."
                  : 'No articles available yet.'}
              </p>
              {filter === 'mine' && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Go to Chat and generate your first article!
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Article Header */}
                <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                      {article.title}
                    </h2>
                    <button
                      onClick={() => copyArticle(article.content, article.id)}
                      className="shrink-0 p-2 sm:p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Copy article content"
                      aria-label="Copy article"
                    >
                      {copiedId === article.id ? (
                        <ClipboardDocumentCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      ) : (
                        <ClipboardDocumentIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Article Meta */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {(article.author_name || article.user_name || article.user_email) && (
                      <div className="flex items-center gap-2">
                        <UserCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>{article.author_name || article.user_name || article.user_email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <time dateTime={article.created_at}>
                        {new Date(article.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <div className="px-6 sm:px-8 py-6 sm:py-8">
                  <div className="prose prose-sm sm:prose-lg prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({ inline, className, children, ...props }: any) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <CodeBlock
                              language={match[1]}
                              code={String(children).replace(/\n$/, '')}
                            />
                          ) : (
                            <code
                              className="bg-gray-200 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {article.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
