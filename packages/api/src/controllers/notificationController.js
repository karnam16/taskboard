import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  async list(req, res, next) {
    try {
      const notifications = await notificationService.getUserNotifications(req.user._id);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user._id);
      res.json(notification);
    } catch (error) {
      next(error);
    }
  },
};
