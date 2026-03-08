import axios from 'axios';

const resolveBaseURL = () => {
  const envBase = import.meta.env.VITE_API_BASE_URL;

  // If running in the browser and the env points to localhost, but the app is opened
  // from a non-localhost domain (e.g. ngrok), calling localhost would target the *user's*
  // device instead of your server. In that case, force same-origin `/api`.
  if (typeof window !== 'undefined') {
    const isRemoteHost = !['localhost', '127.0.0.1'].includes(window.location.hostname);
    const envLooksLocal =
      typeof envBase === 'string' && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/i.test(envBase);

    if (isRemoteHost && envLooksLocal) {
      return `${window.location.origin}/api`;
    }
  }

  return envBase || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: resolveBaseURL()
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
