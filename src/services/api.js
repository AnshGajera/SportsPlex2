import axios from 'axios';

// Create an instance of axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend's base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor to add the JWT token to every request if it exists.
 * This ensures that your authenticated routes on the backend are protected.
 */
api.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
