import axios from 'axios';

const API_URL = 'http://localhost:3000/api/articles';

export const fetchArticles = () => {
  return axios.get(API_URL);
};

export const generateArticle = (title: string, details?: string) => {
  return axios.post(`${API_URL}/generate`, { title, details });
};
