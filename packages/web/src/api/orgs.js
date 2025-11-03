import { apiClient } from './client';

export const orgsApi = {
  list: () => apiClient.get('/orgs'),
  create: data => apiClient.post('/orgs', data),
  getById: id => apiClient.get(`/orgs/${id}`),
};
