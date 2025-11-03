import { apiClient } from './client';

export const labelsApi = {
  list: boardId => apiClient.get('/labels', { params: { boardId } }),
  create: data => apiClient.post('/labels', data),
  update: (id, data) => apiClient.put(`/labels/${id}`, data),
  delete: id => apiClient.delete(`/labels/${id}`),
};
