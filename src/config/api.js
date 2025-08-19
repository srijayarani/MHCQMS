const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://mhcqms.onrender.com/api',
  ENDPOINTS: {
    AUTH: '/auth',
    PATIENTS: '/patients',
    APPOINTMENTS: '/appointments',
    QUEUE: '/queue',
    REPORTS: '/reports'
  }
};

export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export default API_CONFIG;
