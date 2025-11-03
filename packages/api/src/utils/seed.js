import { config } from '../config/env.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Org } from '../models/Org.js';
import { Membership } from '../models/Membership.js';
import { Board } from '../models/Board.js';
import { List } from '../models/List.js';
import { Card } from '../models/Card.js';
import { Label } from '../models/Label.js';
import { logger } from '../config/logger.js';

const seed = async () => {
  try {
    await connectDatabase();
    logger.info('Connected to database, starting seed...');

    await User.deleteMany({});
    await Org.deleteMany({});
    await Membership.deleteMany({});
    await Board.deleteMany({});
    await List.deleteMany({});
    await Card.deleteMany({});
    await Label.deleteMany({});

    const passwordHash = await User.hashPassword('password123');
    const user = await User.create({
      email: 'demo@taskboard.com',
      passwordHash,
      name: 'Demo User',
    });

    const org = await Org.create({
      name: 'Demo Organization',
      ownerId: user._id,
    });

    await Membership.create({
      orgId: org._id,
      userId: user._id,
      role: 'owner',
    });

    const board = await Board.create({
      orgId: org._id,
      name: 'My First Board',
      description: 'A demo board to get started',
      order: 1024,
      createdBy: user._id,
    });

    const todoList = await List.create({
      boardId: board._id,
      name: 'To Do',
      order: 1024,
    });

    const inProgressList = await List.create({
      boardId: board._id,
      name: 'In Progress',
      order: 2048,
    });

    const doneList = await List.create({
      boardId: board._id,
      name: 'Done',
      order: 3072,
    });

    const labels = await Label.insertMany([
      { boardId: board._id, name: 'Bug', color: '#EF4444' },
      { boardId: board._id, name: 'Feature', color: '#3B82F6' },
      { boardId: board._id, name: 'Enhancement', color: '#10B981' },
      { boardId: board._id, name: 'Documentation', color: '#F59E0B' },
    ]);

    await Card.insertMany([
      {
        boardId: board._id,
        listId: todoList._id,
        title: 'Setup project repository',
        description: 'Initialize the project with all necessary dependencies',
        order: 1024,
        labels: [labels[1]._id],
      },
      {
        boardId: board._id,
        listId: todoList._id,
        title: 'Design database schema',
        description: 'Create ERD and define all collections',
        order: 2048,
        labels: [labels[3]._id],
      },
      {
        boardId: board._id,
        listId: inProgressList._id,
        title: 'Implement authentication',
        description: 'Add JWT-based auth with refresh tokens',
        order: 1024,
        labels: [labels[1]._id],
        checklist: [
          { id: '1', text: 'Create User model', done: true },
          { id: '2', text: 'Add login endpoint', done: true },
          { id: '3', text: 'Add token refresh', done: false },
        ],
      },
      {
        boardId: board._id,
        listId: doneList._id,
        title: 'Write project documentation',
        description: 'Create comprehensive README',
        order: 1024,
        labels: [labels[3]._id],
        checklist: [
          { id: '1', text: 'Setup instructions', done: true },
          { id: '2', text: 'API documentation', done: true },
        ],
      },
    ]);

    logger.info('Seed completed successfully!');
    logger.info('Demo user credentials:');
    logger.info('  Email: demo@taskboard.com');
    logger.info('  Password: password123');

    await disconnectDatabase();
  } catch (error) {
    logger.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
