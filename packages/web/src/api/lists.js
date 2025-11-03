import { apiClient } from './client';

export const listsApi = {
  create: data => apiClient.post('/lists', data),
  update: (id, data) => apiClient.put(`/lists/${id}`, data),
  delete: id => apiClient.delete(`/lists/${id}`),
  reorder: (id, order) => apiClient.post(`/lists/${id}/reorder`, { order }),
};
