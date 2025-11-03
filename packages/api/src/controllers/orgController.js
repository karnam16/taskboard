import { Org } from '../models/Org.js';
import { Membership } from '../models/Membership.js';

export const orgController = {
  async create(req, res, next) {
    try {
      const { name } = req.body;
      const org = await Org.create({
        name,
        ownerId: req.user._id,
      });

      await Membership.create({
        orgId: org._id,
        userId: req.user._id,
        role: 'owner',
      });

      res.status(201).json(org);
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const memberships = await Membership.find({
        userId: req.user._id,
      }).populate('orgId');

      const orgs = memberships.map(m => ({
        ...m.orgId.toObject(),
        role: m.role,
      }));

      res.json(orgs);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const org = await Org.findById(req.params.id);
      if (!org) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      const membership = await Membership.findOne({
        orgId: org._id,
        userId: req.user._id,
      });

      if (!membership) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ ...org.toObject(), role: membership.role });
    } catch (error) {
      next(error);
    }
  },
};
