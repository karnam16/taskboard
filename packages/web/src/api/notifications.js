import { apiClient } from './client';

export const notificationsApi = {
  list: () => apiClient.get('/notifications'),
  markAsRead: id => apiClient.put(`/notifications/${id}/read`),
};
