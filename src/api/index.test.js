/**
 * API Endpoints Test Suite
 * 
 * This test file covers the main API endpoints:
 * - Health check endpoint (GET /health)
 * - Task listing endpoint (GET /tasks)
 * - Task creation endpoint (POST /tasks)
 * - Task update endpoint (PATCH /tasks/:id)
 * 
 * Tests verify correct HTTP status codes, response formats, error handling,
 * and database interactions for all endpoints.
 */

const request = require('supertest');
const express = require('express');
const db = require('./db');

// Mock the database module
jest.mock('./db');

// Create the app for testing
const createApp = () => {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // GET /tasks — list all tasks
  app.get('/tasks', async (_req, res) => {
    const { rows } = await db.query('SELECT * FROM tasks ORDER BY created_at ASC');
    res.json(rows);
  });

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

  // PATCH /tasks/:id — update a task (complete/uncomplete or rename)
  app.patch('/tasks/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { completed, title } = req.body;

    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const current = rows[0];
    const newCompleted = completed !== undefined ? Boolean(completed) : current.completed;
    const newTitle = title !== undefined ? title.trim() : current.title;

    const { rows: updated } = await db.query(
      'UPDATE tasks SET completed = $1, title = $2 WHERE id = $3 RETURNING *',
      [newCompleted, newTitle, id]
    );
    res.json(updated[0]);
  });

  return app;
};

describe('API Endpoints', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return status ok', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /tasks', () => {
    it('should return an empty list of tasks', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM tasks ORDER BY created_at ASC');
    });

    it('should return a list of tasks', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', completed: false, created_at: '2024-01-01' },
        { id: 2, title: 'Task 2', completed: true, created_at: '2024-01-02' },
      ];
      db.query.mockResolvedValue({ rows: mockTasks });

      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body).toEqual(mockTasks);
    });
  });

  describe('POST /tasks', () => {
    it('should create a task with a valid title', async () => {
      const newTask = { id: 1, title: 'New Task', completed: false, created_at: '2024-01-01' };
      db.query.mockResolvedValue({ rows: [newTask] });

      const response = await request(app)
        .post('/tasks')
        .send({ title: 'New Task' })
        .expect(201);

      expect(response.body).toEqual(newTask);
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
        ['New Task']
      );
    });

    it('should trim whitespace from title', async () => {
      const newTask = { id: 1, title: 'Trimmed Task', completed: false, created_at: '2024-01-01' };
      db.query.mockResolvedValue({ rows: [newTask] });

      const response = await request(app)
        .post('/tasks')
        .send({ title: '  Trimmed Task  ' })
        .expect(201);

      expect(response.body).toEqual(newTask);
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
        ['Trimmed Task']
      );
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({})
        .expect(400);

      expect(response.body).toEqual({ error: 'title is required' });
    });

    it('should return 400 if title is empty string', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: '' })
        .expect(400);

      expect(response.body).toEqual({ error: 'title is required' });
    });

    it('should return 400 if title is only whitespace', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: '   ' })
        .expect(400);

      expect(response.body).toEqual({ error: 'title is required' });
    });

    it('should return 400 if title is not a string', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: 123 })
        .expect(400);

      expect(response.body).toEqual({ error: 'title is required' });
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('should update a task title', async () => {
      const existingTask = { id: 1, title: 'Old Title', completed: false };
      const updatedTask = { id: 1, title: 'New Title', completed: false };

      db.query
        .mockResolvedValueOnce({ rows: [existingTask] })
        .mockResolvedValueOnce({ rows: [updatedTask] });

      const response = await request(app)
        .patch('/tasks/1')
        .send({ title: 'New Title' })
        .expect(200);

      expect(response.body).toEqual(updatedTask);
    });

    it('should update a task completed status', async () => {
      const existingTask = { id: 1, title: 'Task', completed: false };
      const updatedTask = { id: 1, title: 'Task', completed: true };

      db.query
        .mockResolvedValueOnce({ rows: [existingTask] })
        .mockResolvedValueOnce({ rows: [updatedTask] });

      const response = await request(app)
        .patch('/tasks/1')
        .send({ completed: true })
        .expect(200);

      expect(response.body).toEqual(updatedTask);
    });

    it('should return 404 if task does not exist', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .patch('/tasks/999')
        .send({ title: 'New Title' })
        .expect(404);

      expect(response.body).toEqual({ error: 'Not found' });
    });
  });
});
