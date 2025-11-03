import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

export const initializeSocket = (server, redisClient) => {
  const io = new Server(server, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, config.jwt.accessSecret);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', socket => {
    logger.info(`Socket connected: ${socket.id}, userId: ${socket.userId}`);

    socket.on('join_board', boardId => {
      socket.join(`board:${boardId}`);
      logger.debug(`User ${socket.userId} joined board ${boardId}`);

      if (config.features.realtimePresence) {
        socket.to(`board:${boardId}`).emit('user_joined', {
          userId: socket.userId,
        });
      }
    });

    socket.on('leave_board', boardId => {
      socket.leave(`board:${boardId}`);
      logger.debug(`User ${socket.userId} left board ${boardId}`);

      if (config.features.realtimePresence) {
        socket.to(`board:${boardId}`).emit('user_left', {
          userId: socket.userId,
        });
      }
    });

    socket.on('typing_start', ({ boardId, cardId }) => {
      if (config.features.realtimeTyping) {
        socket.to(`board:${boardId}`).emit('user_typing', {
          userId: socket.userId,
          cardId,
        });
      }
    });

    socket.on('typing_stop', ({ boardId, cardId }) => {
      if (config.features.realtimeTyping) {
        socket.to(`board:${boardId}`).emit('user_stopped_typing', {
          userId: socket.userId,
          cardId,
        });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const emitBoardUpdate = (io, boardId, event, data) => {
  io.to(`board:${boardId}`).emit(event, data);
};
