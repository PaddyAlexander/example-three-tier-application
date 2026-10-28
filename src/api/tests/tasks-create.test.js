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

// POST /tasks — create a task
app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const { rows } = await db.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title.trim()]
  );
  res.status(201).json(rows[0]);
});

describe('POST /tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a task with a valid title', async () => {
    const newTask = {
      id: 1,
      title: 'New Task',
      completed: false,
      created_at: '2024-01-01T00:00:00Z'
    };
    mockDb.query.mockResolvedValue({ rows: [newTask] });

    const response = await request(app)
      .post('/tasks')
      .send({ title: 'New Task' })
      .expect(201);

    expect(response.body).toEqual(newTask);
    expect(mockDb.query).toHaveBeenCalledWith(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      ['New Task']
    );
  });

  it('should trim whitespace from title', async () => {
    const newTask = {
      id: 1,
      title: 'Trimmed Task',
      completed: false,
      created_at: '2024-01-01T00:00:00Z'
    };
    mockDb.query.mockResolvedValue({ rows: [newTask] });

    const response = await request(app)
      .post('/tasks')
      .send({ title: '  Trimmed Task  ' })
      .expect(201);

    expect(response.body).toEqual(newTask);
    expect(mockDb.query).toHaveBeenCalledWith(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      ['Trimmed Task']
    );
  });

  it('should return 400 when title is missing', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({})
      .expect(400);

    expect(response.body).toEqual({ error: 'title is required' });
    expect(mockDb.query).not.toHaveBeenCalled();
  });

  it('should return 400 when title is empty string', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: '' })
      .expect(400);

    expect(response.body).toEqual({ error: 'title is required' });
    expect(mockDb.query).not.toHaveBeenCalled();
  });

  it('should return 400 when title is only whitespace', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: '   ' })
      .expect(400);

    expect(response.body).toEqual({ error: 'title is required' });
    expect(mockDb.query).not.toHaveBeenCalled();
  });

  it('should return 400 when title is not a string', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: 123 })
      .expect(400);

    expect(response.body).toEqual({ error: 'title is required' });
    expect(mockDb.query).not.toHaveBeenCalled();
  });

  it('should return 400 when title is null', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: null })
      .expect(400);

    expect(response.body).toEqual({ error: 'title is required' });
    expect(mockDb.query).not.toHaveBeenCalled();
  });

  it('should return JSON content type', async () => {
    const newTask = {
      id: 1,
      title: 'New Task',
      completed: false,
      created_at: '2024-01-01T00:00:00Z'
    };
    mockDb.query.mockResolvedValue({ rows: [newTask] });

    const response = await request(app)
      .post('/tasks')
      .send({ title: 'New Task' })
      .expect('Content-Type', /json/);

    expect(response.status).toBe(201);
  });

  it('should handle database errors gracefully', async () => {
    mockDb.query.mockRejectedValue(new Error('Database error'));

    await request(app)
      .post('/tasks')
      .send({ title: 'New Task' })
      .expect(500);
  });
});
