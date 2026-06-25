import axios from 'axios';

// Use VITE_API_URL in production (e.g. https://api.yourdomain.com); dev uses proxy when unset
const rawBackendUrl = import.meta.env.VITE_API_URL?.replace(/\/\/$/, '') || '';
const baseURL = rawBackendUrl ? `${rawBackendUrl}/api` : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getUploadUrl = (relativePath) => {
  if (!relativePath) return '';
  // Already absolute
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  // Ensure leading slash for backend static `/uploads`
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return rawBackendUrl ? `${rawBackendUrl}${path}` : path;
};

export const authAPI = {
  registerFarmer: (data) => api.post('/auth/register/farmer', data),
  registerOfficer: (data) => api.post('/auth/register/officer', data),
  loginFarmer: (data) => api.post('/auth/login/farmer', data),
  loginOfficer: (data) => api.post('/auth/login/officer', data),
  getMe: () => api.get('/auth/me')
};

export const farmerAPI = {
  submitClaim: (data) => api.post('/farmer/claims', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getClaims: (params) => api.get('/farmer/claims', { params }),
  getClaim: (id) => api.get(`/farmer/claims/${id}`),
  deleteClaim: (id) => api.delete(`/farmer/claims/${id}`),
  getWallet: () => api.get('/farmer/wallet'),
  withdraw: (data) => api.post('/farmer/wallet/withdraw', data),
  updateProfile: (data) => api.put('/farmer/profile', data),
  getDashboard: () => api.get('/farmer/dashboard'),
  applyScheme: (data) => api.post('/farmer/schemes/apply', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getSchemeApplications: () => api.get('/farmer/schemes/applications')
};

export const officerAPI = {
  getPendingClaims: (params) => api.get('/officer/claims/pending', { params }),
  getAllClaims: (params) => api.get('/officer/claims', { params }),
  getClaim: (id) => api.get(`/officer/claims/${id}`),
  runClaimAnalysis: (id) => api.post(`/officer/claims/${id}/analyze`),
  verifyClaim: (id, data) => api.post(`/officer/claims/${id}/verify`, data),
  getDashboard: () => api.get('/officer/dashboard'),
  getAuditLogs: (params) => api.get('/officer/audit-logs', { params }),
  getFunds: () => api.get('/officer/funds'),
  addFunds: (data) => api.post('/officer/funds/add', data),
  getAnalytics: () => api.get('/officer/analytics'),
  getSchemeApplications: (params) => api.get('/officer/schemes', { params }),
  verifyScheme: (id, data) => api.post(`/officer/schemes/${id}/verify`, data)
};

export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

export default api;
