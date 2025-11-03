import { Label } from '../models/Label.js';

export const labelController = {
  async create(req, res, next) {
    try {
      const { boardId, name, color } = req.body;

      const label = await Label.create({
        boardId,
        name,
        color,
      });

      res.status(201).json(label);
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const { boardId } = req.query;
      const labels = await Label.find({ boardId });
      res.json(labels);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { name, color } = req.body;
      const label = await Label.findById(req.params.id);

      if (!label) {
        return res.status(404).json({ error: 'Label not found' });
      }

      if (name) label.name = name;
      if (color) label.color = color;

      await label.save();
      res.json(label);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const label = await Label.findById(req.params.id);

      if (!label) {
        return res.status(404).json({ error: 'Label not found' });
      }

      await Label.deleteOne({ _id: label._id });
      res.json({ message: 'Label deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
