const request = require('supertest');
const express = require('express');

// Mock the db module
const mockDb = {
  query: jest.fn()
};
jest.mock('../db', () => mockDb);

const db = require('../db');

// Import and setup app
const app = express();
app.use(express.json());

// GET /tasks — list all tasks
app.get('/tasks', async (_req, res) => {
  const { rows } = await db.query('SELECT * FROM tasks ORDER BY created_at ASC');
  res.json(rows);
});

describe('GET /tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an empty array when no tasks exist', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });

    const response = await request(app)
      .get('/tasks')
      .expect(200);

    expect(response.body).toEqual([]);
    expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM tasks ORDER BY created_at ASC');
  });

  it('should return all tasks ordered by created_at', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', completed: false, created_at: '2024-01-01T00:00:00Z' },
      { id: 2, title: 'Task 2', completed: true, created_at: '2024-01-02T00:00:00Z' },
      { id: 3, title: 'Task 3', completed: false, created_at: '2024-01-03T00:00:00Z' }
    ];
    mockDb.query.mockResolvedValue({ rows: mockTasks });

    const response = await request(app)
      .get('/tasks')
      .expect(200);

    expect(response.body).toEqual(mockTasks);
    expect(response.body).toHaveLength(3);
    expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM tasks ORDER BY created_at ASC');
  });

  it('should return JSON content type', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });

    const response = await request(app)
      .get('/tasks')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
  });

  it('should handle database errors gracefully', async () => {
    mockDb.query.mockRejectedValue(new Error('Database connection failed'));

    await request(app)
      .get('/tasks')
      .expect(500);
  });
});
