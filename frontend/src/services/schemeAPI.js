import api from './api';

export const schemeAPI = {
  getRequiredDocuments: (schemeName) => api.get(`/farmer/schemes/${schemeName}/documents`),
  applyForScheme: (formData) => api.post('/farmer/schemes/apply', formData),
  getApplications: () => api.get('/farmer/schemes/applications')
};
