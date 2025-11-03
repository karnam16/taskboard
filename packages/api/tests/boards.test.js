import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { User } from '../src/models/User.js';
import { Org } from '../src/models/Org.js';
import { Membership } from '../src/models/Membership.js';
import { Board } from '../src/models/Board.js';

let app;
let accessToken;
let user;
let org;

beforeAll(async () => {
  await connectDatabase();
  app = createApp();
});

afterAll(async () => {
  await disconnectDatabase();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Org.deleteMany({});
  await Membership.deleteMany({});
  await Board.deleteMany({});

  const response = await request(app).post('/api/auth/register').send({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  });

  accessToken = response.body.accessToken;
  user = response.body.user;

  org = await Org.create({
    name: 'Test Org',
    ownerId: user._id,
  });

  await Membership.create({
    orgId: org._id,
    userId: user._id,
    role: 'owner',
  });
});

describe('Board API', () => {
  describe('POST /api/boards', () => {
    it('should create a board', async () => {
      const response = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          orgId: org._id.toString(),
          name: 'Test Board',
          description: 'A test board',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Board');
      expect(response.body.orgId).toBe(org._id.toString());
    });
  });

  describe('GET /api/boards', () => {
    beforeEach(async () => {
      await Board.create({
        orgId: org._id,
        name: 'Board 1',
        order: 1024,
        createdBy: user._id,
      });
      await Board.create({
        orgId: org._id,
        name: 'Board 2',
        order: 2048,
        createdBy: user._id,
      });
    });

    it('should list boards for org', async () => {
      const response = await request(app)
        .get('/api/boards')
        .query({ orgId: org._id.toString() })
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Board 1');
    });
  });

  describe('GET /api/boards/:id', () => {
    let board;

    beforeEach(async () => {
      board = await Board.create({
        orgId: org._id,
        name: 'Test Board',
        order: 1024,
        createdBy: user._id,
      });
    });

    it('should get board by id', async () => {
      const response = await request(app)
        .get(`/api/boards/${board._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Test Board');
    });
  });
});
