import { List } from '../models/List.js';
import { activityService } from '../services/activityService.js';

export const listController = {
  async list(req, res, next) {
    try {
      const { boardId } = req.query;
      const lists = await List.find({ boardId }).sort('order');
      res.json(lists);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { boardId, name } = req.body;

      const maxOrder = await List.findOne({ boardId }).sort('-order').select('order');
      const order = maxOrder ? maxOrder.order + 1024 : 1024;

      const list = await List.create({
        boardId,
        name,
        order,
      });

      await activityService.logActivity({
        orgId: req.orgId,
        boardId,
        actorId: req.user._id,
        type: 'list_created',
        payload: { listName: name },
      });

      res.status(201).json(list);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { name } = req.body;
      const list = await List.findById(req.params.id);

      if (!list) {
        return res.status(404).json({ error: 'List not found' });
      }

      list.name = name;
      await list.save();

      await activityService.logActivity({
        orgId: req.orgId,
        boardId: list.boardId,
        actorId: req.user._id,
        type: 'list_updated',
        payload: { listName: name },
      });

      res.json(list);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const list = await List.findById(req.params.id);

      if (!list) {
        return res.status(404).json({ error: 'List not found' });
      }

      await List.deleteOne({ _id: list._id });

      await activityService.logActivity({
        orgId: req.orgId,
        boardId: list.boardId,
        actorId: req.user._id,
        type: 'list_deleted',
        payload: { listName: list.name },
      });

      res.json({ message: 'List deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async reorder(req, res, next) {
    try {
      const { order } = req.body;
      const list = await List.findById(req.params.id);

      if (!list) {
        return res.status(404).json({ error: 'List not found' });
      }

      list.order = order;
      await list.save();

      res.json(list);
    } catch (error) {
      next(error);
    }
  },
};
