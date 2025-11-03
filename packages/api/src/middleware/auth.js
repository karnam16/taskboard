import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Membership } from '../models/Membership.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireOrgMembership = (minRole = 'member') => {
  const roleHierarchy = { owner: 3, admin: 2, member: 1 };

  return async (req, res, next) => {
    try {
      const orgId = req.params.orgId || req.body.orgId || req.query.orgId;

      if (!orgId) {
        return res.status(400).json({ error: 'Organization ID required' });
      }

      const membership = await Membership.findOne({
        orgId,
        userId: req.user._id,
      });

      if (!membership) {
        return res.status(403).json({ error: 'Not a member of this organization' });
      }

      if (roleHierarchy[membership.role] < roleHierarchy[minRole]) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.membership = membership;
      req.orgId = orgId;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireBoardAccess = async (req, res, next) => {
  try {
    const boardId = req.params.boardId || req.params.id || req.body.boardId;

    if (!boardId) {
      return res.status(400).json({ error: 'Board ID required' });
    }

    const Board = (await import('../models/Board.js')).Board;
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const membership = await Membership.findOne({
      orgId: board.orgId,
      userId: req.user._id,
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.board = board;
    req.membership = membership;
    req.orgId = board.orgId;
    next();
  } catch (error) {
    next(error);
  }
};
