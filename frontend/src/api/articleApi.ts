import axios from 'axios';

// Use environment variable or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchArticles = () => {
  return axios.get(`${API_URL}/articles`);
};

export const generateArticle = (title: string, details?: string) => {
  return axios.post(
    `${API_URL}/articles/generate`,
    { title, details },
    { headers: getAuthHeaders() }
  );
};

export const bulkGenerateArticles = (titles: string[], details?: string) => {
  return axios.post(
    `${API_URL}/articles/bulk-generate`,
    { titles, details },
    { headers: getAuthHeaders() }
  );
};

export const deleteArticle = (id: number) => {
  return axios.delete(`${API_URL}/articles/${id}`, { headers: getAuthHeaders() });
};
