import { Board } from '../models/Board.js';
import { activityService } from '../services/activityService.js';

export const boardController = {
  async create(req, res, next) {
    try {
      const { name, description } = req.body;
      const orgId = req.orgId;

      const maxOrder = await Board.findOne({ orgId }).sort('-order').select('order');
      const order = maxOrder ? maxOrder.order + 1024 : 1024;

      const board = await Board.create({
        orgId,
        name,
        description,
        order,
        createdBy: req.user._id,
      });

      await activityService.logActivity({
        orgId,
        boardId: board._id,
        actorId: req.user._id,
        type: 'board_created',
        payload: { boardName: name },
      });

      res.status(201).json(board);
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const orgId = req.query.orgId || req.orgId;
      const boards = await Board.find({ orgId }).sort('order');
      res.json(boards);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      res.json(req.board);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { name, description } = req.body;
      const board = req.board;

      if (name) board.name = name;
      if (description !== undefined) board.description = description;

      await board.save();

      await activityService.logActivity({
        orgId: board.orgId,
        boardId: board._id,
        actorId: req.user._id,
        type: 'board_updated',
        payload: { boardName: board.name },
      });

      res.json(board);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const board = req.board;

      if (req.membership.role !== 'owner' && req.membership.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      await Board.deleteOne({ _id: board._id });

      await activityService.logActivity({
        orgId: board.orgId,
        boardId: board._id,
        actorId: req.user._id,
        type: 'board_deleted',
        payload: { boardName: board.name },
      });

      res.json({ message: 'Board deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getActivity(req, res, next) {
    try {
      const activities = await activityService.getBoardActivity(req.board._id);
      res.json(activities);
    } catch (error) {
      next(error);
    }
  },
};
