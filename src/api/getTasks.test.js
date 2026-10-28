const request = require('supertest');
const express = require('express');

// Mock database
const mockDb = {
  query: jest.fn(),
};

// Create app for testing
const app = express();
app.use(express.json());

app.get('/tasks', async (_req, res) => {
  const { rows } = await mockDb.query('SELECT * FROM tasks ORDER BY created_at ASC');
  res.json(rows);
});

describe('GET /tasks', () => {
  beforeEach(() => {
    mockDb.query.mockClear();
  });

  it('should return an empty array when no tasks exist', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });

    const response = await request(app)
      .get('/tasks')
      .expect(200);

    expect(response.body).toEqual([]);
    expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM tasks ORDER BY created_at ASC');
  });

  it('should return all tasks from database', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', completed: false, created_at: '2024-01-01T00:00:00Z' },
      { id: 2, title: 'Task 2', completed: true, created_at: '2024-01-02T00:00:00Z' },
    ];
    mockDb.query.mockResolvedValue({ rows: mockTasks });

    const response = await request(app)
      .get('/tasks')
      .expect(200);

    expect(response.body).toEqual(mockTasks);
    expect(response.body).toHaveLength(2);
  });

  it('should return tasks with correct structure', async () => {
    const mockTasks = [
      { id: 1, title: 'Test Task', completed: false, created_at: '2024-01-01T00:00:00Z' },
    ];
    mockDb.query.mockResolvedValue({ rows: mockTasks });

    const response = await request(app)
      .get('/tasks')
      .expect(200);

    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('title');
    expect(response.body[0]).toHaveProperty('completed');
    expect(response.body[0]).toHaveProperty('created_at');
  });

  it('should return JSON content type', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });

    const response = await request(app)
      .get('/tasks')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
  });

  it('should return tasks ordered by created_at', async () => {
    const mockTasks = [
      { id: 1, title: 'First', completed: false, created_at: '2024-01-01T00:00:00Z' },
      { id: 2, title: 'Second', completed: false, created_at: '2024-01-02T00:00:00Z' },
      { id: 3, title: 'Third', completed: false, created_at: '2024-01-03T00:00:00Z' },
    ];
    mockDb.query.mockResolvedValue({ rows: mockTasks });

    const response = await request(app)
      .get('/tasks')
      .expect(200);

    expect(response.body).toEqual(mockTasks);
    expect(response.body[0].created_at).toBe('2024-01-01T00:00:00Z');
    expect(response.body[2].created_at).toBe('2024-01-03T00:00:00Z');
  });
});
