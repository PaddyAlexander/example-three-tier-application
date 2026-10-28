const request = require('supertest');
const express = require('express');

// Mock the database module before requiring the app
jest.mock('./db', () => ({
  query: jest.fn(),
}));

const db = require('./db');

// Create the app (same code as index.js but exported for testing)
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
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Create a fresh app instance for each test
    app = createApp();
  });

  describe('GET /health', () => {
    it('should return { status: "ok" }', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /tasks', () => {
    it('should return an array of tasks', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', completed: false, created_at: '2024-01-01T00:00:00Z' },
        { id: 2, title: 'Task 2', completed: true, created_at: '2024-01-02T00:00:00Z' },
      ];

      db.query.mockResolvedValueOnce({ rows: mockTasks });

      const response = await request(app)
        .get('/tasks')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(mockTasks);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM tasks ORDER BY created_at ASC');
    });

    it('should return an empty array when no tasks exist', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/tasks')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task and return it with status 201', async () => {
      const newTask = {
        id: 1,
        title: 'New Task',
        completed: false,
        created_at: '2024-01-01T00:00:00Z',
      };

      db.query.mockResolvedValueOnce({ rows: [newTask] });

      const response = await request(app)
        .post('/tasks')
        .send({ title: 'New Task' })
        .expect(201)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual(newTask);
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
        ['New Task']
      );
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({})
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({ error: 'title is required' });
    });

    it('should return 400 when title is empty string', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: '   ' })
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({ error: 'title is required' });
    });

    it('should trim whitespace from title', async () => {
      const newTask = {
        id: 1,
        title: 'New Task',
        completed: false,
        created_at: '2024-01-01T00:00:00Z',
      };

      db.query.mockResolvedValueOnce({ rows: [newTask] });

      await request(app)
        .post('/tasks')
        .send({ title: '  New Task  ' })
        .expect(201);

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
        ['New Task']
      );
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('should update a task and return the updated task', async () => {
      const existingTask = {
        id: 1,
        title: 'Old Title',
        completed: false,
        created_at: '2024-01-01T00:00:00Z',
      };

      const updatedTask = {
        id: 1,
        title: 'New Title',
        completed: true,
        created_at: '2024-01-01T00:00:00Z',
      };

      db.query
        .mockResolvedValueOnce({ rows: [existingTask] })
        .mockResolvedValueOnce({ rows: [updatedTask] });

      const response = await request(app)
        .patch('/tasks/1')
        .send({ title: 'New Title', completed: true })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual(updatedTask);
    });

    it('should return 404 when task does not exist', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .patch('/tasks/999')
        .send({ title: 'New Title' })
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({ error: 'Not found' });
    });
  });
});
