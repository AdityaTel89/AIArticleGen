import { useState } from 'react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (email: string, password: string) => Promise<void>;
}

export default function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await onSubmit(email, password);
    } catch {
      setErrorMsg('Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
      {errorMsg && <p className="text-red-600 mb-2">{errorMsg}</p>}
      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-3 mb-4 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
      />
      <input
        type="password"
        placeholder="Password"
        required
        minLength={6}
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full p-3 mb-4 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded disabled:opacity-70"
      >
        {loading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Register'}
      </button>
    </form>
  );
}
