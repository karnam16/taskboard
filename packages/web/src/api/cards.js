import { apiClient } from './client';

export const cardsApi = {
  create: data => apiClient.post('/cards', data),
  update: (id, data) => apiClient.put(`/cards/${id}`, data),
  delete: id => apiClient.delete(`/cards/${id}`),
  move: (id, data) => apiClient.post(`/cards/${id}/move`, data),
};
