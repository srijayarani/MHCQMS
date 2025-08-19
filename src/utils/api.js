import axios from 'axios';
import {getApiUrl} from '../config/api';

const api = axios.create({
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiCall = async (method, endpoint, data = null, params = null) => {
  try {
    const config = {
      method,
      url: getApiUrl(endpoint),
      ...(data && {data}),
      ...(params && {params}),
    };
    
    const response = await api(config);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || error.message;
  }
};

export default api;
