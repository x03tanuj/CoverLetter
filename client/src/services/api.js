import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:4000`;

const API = axios.create({
  baseURL: apiBaseUrl
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
