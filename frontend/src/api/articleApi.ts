import axios from 'axios';

const API_URL = 'http://localhost:3000/api/articles';

// Get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchArticles = () => {
  return axios.get(API_URL);
};

export const generateArticle = (title: string, details?: string) => {
  return axios.post(
    `${API_URL}/generate`,
    { title, details },
    { headers: getAuthHeaders() }
  );
};

export const bulkGenerateArticles = (titles: string[], details?: string) => {
  return axios.post(
    `${API_URL}/bulk-generate`,
    { titles, details },
    { headers: getAuthHeaders() }
  );
};

export const deleteArticle = (id: number) => {
  return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
};
