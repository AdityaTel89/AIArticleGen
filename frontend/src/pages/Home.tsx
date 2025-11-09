import { useState } from 'react';
import { generateArticle } from '../api/articleApi';

export default function Home() {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    if (!title.trim()) {
      setMessage('Please enter a title');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      await generateArticle(title, details);
      setMessage('Article generated successfully!');
      setTitle('');
      setDetails('');
    } catch (error) {
      setMessage('Error generating article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        AI Article Generator
      </h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Article Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter article title..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Details (Optional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Add any specific requirements..."
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Article'}
        </button>

        {message && (
          <p className={`mt-4 text-center ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>

      <div className="mt-6 text-center">
        <a href="/blog" className="text-blue-600 hover:underline">
          View All Articles →
        </a>
      </div>
    </div>
  );
}
