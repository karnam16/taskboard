import { Card } from '../models/Card.js';
import { activityService } from '../services/activityService.js';
import { notificationService } from '../services/notificationService.js';

export const cardController = {
  async list(req, res, next) {
    try {
      const { boardId } = req.query;
      const cards = await Card.find({ boardId }).sort('order');
      res.json(cards);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { boardId, listId, title, description } = req.body;

      const maxOrder = await Card.findOne({ listId }).sort('-order').select('order');
      const order = maxOrder ? maxOrder.order + 1024 : 1024;

      const card = await Card.create({
        boardId,
        listId,
        title,
        description,
        order,
      });

      await activityService.logActivity({
        orgId: req.orgId,
        boardId,
        actorId: req.user._id,
        type: 'card_created',
        payload: { cardTitle: title, listId },
      });

      res.status(201).json(card);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { title, description, labels, dueDate, assignees, checklist } = req.body;
      const card = await Card.findById(req.params.id);

      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      const oldAssignees = card.assignees.map(id => id.toString());

      if (title !== undefined) card.title = title;
      if (description !== undefined) card.description = description;
      if (labels !== undefined) card.labels = labels;
      if (dueDate !== undefined) card.dueDate = dueDate;
      if (assignees !== undefined) {
        card.assignees = assignees;

        const newAssignees = assignees.filter(id => !oldAssignees.includes(id));
        const removedAssignees = oldAssignees.filter(id => !assignees.includes(id));

        if (newAssignees.length > 0) {
          await notificationService.notifyAssignees(
            card._id,
            newAssignees,
            req.user._id,
            'assigned'
          );
        }
      }
      if (checklist !== undefined) card.checklist = checklist;

      await card.save();

      await activityService.logActivity({
        orgId: req.orgId,
        boardId: card.boardId,
        actorId: req.user._id,
        type: 'card_updated',
        payload: { cardTitle: card.title, cardId: card._id },
      });

      res.json(card);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const card = await Card.findById(req.params.id);

      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      await Card.deleteOne({ _id: card._id });

      await activityService.logActivity({
        orgId: req.orgId,
        boardId: card.boardId,
        actorId: req.user._id,
        type: 'card_deleted',
        payload: { cardTitle: card.title },
      });

      res.json({ message: 'Card deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async move(req, res, next) {
    try {
      const { listId, order } = req.body;
      const card = await Card.findById(req.params.id);

      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      const oldListId = card.listId;
      card.listId = listId;
      card.order = order;

      await card.save();

      await activityService.logActivity({
        orgId: req.orgId,
        boardId: card.boardId,
        actorId: req.user._id,
        type: 'card_moved',
        payload: {
          cardTitle: card.title,
          fromListId: oldListId,
          toListId: listId,
        },
      });

      res.json(card);
    } catch (error) {
      next(error);
    }
  },
};
