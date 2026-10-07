import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (localStorage.getItem('hx_is_impersonating') === 'true') {
    config.headers['x-impersonating'] = 'true';
  }
  return config;
});

export default api;
