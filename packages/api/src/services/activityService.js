import { Activity } from '../models/Activity.js';

export const activityService = {
  async logActivity({ orgId, boardId, actorId, type, payload }) {
    return Activity.create({
      orgId,
      boardId,
      actorId,
      type,
      payload,
    });
  },

  async getBoardActivity(boardId, limit = 50) {
    return Activity.find({ boardId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('actorId', 'name email');
  },
};
