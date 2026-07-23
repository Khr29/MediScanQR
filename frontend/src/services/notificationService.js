import api from './api';

export const getUserNotifications = async () => {
  const response = await api.get('/notifications/alerts');
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.patch(`/notifications/alerts/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.patch('/notifications/alerts/read-all');
  return response.data;
};