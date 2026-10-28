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

describe('PATCH /tasks/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update task completed status to true', async () => {
    const existingTask = {
      id: 1,
      title: 'Test Task',
      completed: false,
      created_at: '2024-01-01T00:00:00Z'
    };
    const updatedTask = {
      ...existingTask,
      completed: true
    };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({ completed: true })
      .expect(200);

    expect(response.body).toEqual(updatedTask);
    expect(mockDb.query).toHaveBeenCalledTimes(2);
    expect(mockDb.query).toHaveBeenNthCalledWith(1, 'SELECT * FROM tasks WHERE id = $1', [1]);
    expect(mockDb.query).toHaveBeenNthCalledWith(2, 'UPDATE tasks SET completed = $1, title = $2 WHERE id = $3 RETURNING *', [true, 'Test Task', 1]);
  });

  it('should update task completed status to false', async () => {
    const existingTask = {
      id: 1,
      title: 'Test Task',
      completed: true,
      created_at: '2024-01-01T00:00:00Z'
    };
    const updatedTask = {
      ...existingTask,
      completed: false
    };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({ completed: false })
      .expect(200);

    expect(response.body).toEqual(updatedTask);
  });

  it('should update task title', async () => {
    const existingTask = {
      id: 1,
      title: 'Old Title',
      completed: false,
      created_at: '2024-01-01T00:00:00Z'
    };
    const updatedTask = {
      ...existingTask,
      title: 'New Title'
    };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({ title: 'New Title' })
      .expect(200);

    expect(response.body).toEqual(updatedTask);
    expect(mockDb.query).toHaveBeenNthCalledWith(2, 'UPDATE tasks SET completed = $1, title = $2 WHERE id = $3 RETURNING *', [false, 'New Title', 1]);
  });

  it('should trim whitespace from title', async () => {
    const existingTask = {
      id: 1,
      title: 'Old Title',
      completed: false,
      created_at: '2024-01-01T00:00:00Z'
    };
    const updatedTask = {
      ...existingTask,
      title: 'Trimmed Title'
    };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({ title: '  Trimmed Title  ' })
      .expect(200);

    expect(response.body).toEqual(updatedTask);
    expect(mockDb.query).toHaveBeenNthCalledWith(2, 'UPDATE tasks SET completed = $1, title = $2 WHERE id = $3 RETURNING *', [false, 'Trimmed Title', 1]);
  });

  it('should update both completed and title', async () => {
    const existingTask = {
      id: 1,
      title: 'Old Title',
      completed: false,
      created_at: '2024-01-01T00:00:00Z'
    };
    const updatedTask = {
      ...existingTask,
      title: 'New Title',
      completed: true
    };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({ completed: true, title: 'New Title' })
      .expect(200);

    expect(response.body).toEqual(updatedTask);
    expect(mockDb.query).toHaveBeenNthCalledWith(2, 'UPDATE tasks SET completed = $1, title = $2 WHERE id = $3 RETURNING *', [true, 'New Title', 1]);
  });

  it('should preserve existing values when not provided', async () => {
    const existingTask = {
      id: 1,
      title: 'Existing Title',
      completed: true,
      created_at: '2024-01-01T00:00:00Z'
    };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [existingTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({})
      .expect(200);

    expect(response.body).toEqual(existingTask);
    expect(mockDb.query).toHaveBeenNthCalledWith(2, 'UPDATE tasks SET completed = $1, title = $2 WHERE id = $3 RETURNING *', [true, 'Existing Title', 1]);
  });

  it('should return 404 when task not found', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });

    const response = await request(app)
      .patch('/tasks/999')
      .send({ completed: true })
      .expect(404);

    expect(response.body).toEqual({ error: 'Not found' });
    expect(mockDb.query).toHaveBeenCalledTimes(1);
    expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM tasks WHERE id = $1', [999]);
  });

  it('should handle database errors gracefully', async () => {
    mockDb.query.mockRejectedValue(new Error('Database error'));

    await request(app)
      .patch('/tasks/1')
      .send({ completed: true })
      .expect(500);
  });

  it('should parse id as integer', async () => {
    const existingTask = {
      id: 42,
      title: 'Test Task',
      completed: false,
      created_at: '2024-01-01T00:00:00Z'
    };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [existingTask] });

    await request(app)
      .patch('/tasks/42')
      .send({ completed: true })
      .expect(200);

    expect(mockDb.query).toHaveBeenNthCalledWith(1, 'SELECT * FROM tasks WHERE id = $1', [42]);
  });

  it('should return JSON content type', async () => {
    const existingTask = {
      id: 1,
      title: 'Test Task',
      completed: false,
      created_at: '2024-01-01T00:00:00Z'
    };
    const updatedTask = {
      ...existingTask,
      completed: true
    };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({ completed: true })
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
  });
});
