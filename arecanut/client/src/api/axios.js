import axios from 'axios';

// In production (Vercel), use the Render backend URL
// In development, use Vite proxy ('/api')
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const API = axios.create({ baseURL });

// Attach JWT token automatically to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout if token expires (401 response)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;