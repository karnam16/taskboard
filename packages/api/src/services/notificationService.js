import { Notification } from '../models/Notification.js';

export const notificationService = {
  async createNotification({ userId, type, payload }) {
    return Notification.create({
      userId,
      type,
      payload,
    });
  },

  async getUserNotifications(userId, limit = 50) {
    return Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  },

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.readAt = new Date();
    await notification.save();
    return notification;
  },

  async notifyAssignees(cardId, assigneeIds, actorId, action) {
    const notifications = assigneeIds
      .filter(id => id.toString() !== actorId.toString())
      .map(userId => ({
        userId,
        type: 'card_assignment',
        payload: {
          cardId,
          action,
          actorId,
        },
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  },
};
