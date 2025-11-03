import { apiClient } from './client';

export const boardsApi = {
  list: orgId => apiClient.get('/boards', { params: { orgId } }),
  create: data => apiClient.post('/boards', data),
  getById: id => apiClient.get(`/boards/${id}`),
  update: (id, data) => apiClient.put(`/boards/${id}`, data),
  delete: id => apiClient.delete(`/boards/${id}`),
  getActivity: id => apiClient.get(`/boards/${id}/activity`),
};
