const request = require('supertest');
const express = require('express');

// Mock database
const mockDb = {
  query: jest.fn(),
};

// Create app for testing
const app = express();
app.use(express.json());

app.patch('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { completed, title } = req.body;

  const { rows } = await mockDb.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  const current = rows[0];
  const newCompleted = completed !== undefined ? Boolean(completed) : current.completed;
  const newTitle = title !== undefined ? title.trim() : current.title;

  const { rows: updated } = await mockDb.query(
    'UPDATE tasks SET completed = $1, title = $2 WHERE id = $3 RETURNING *',
    [newCompleted, newTitle, id]
  );
  res.json(updated[0]);
});

describe('PATCH /tasks/:id', () => {
  beforeEach(() => {
    mockDb.query.mockClear();
  });

  it('should update task completed status', async () => {
    const existingTask = { id: 1, title: 'Task', completed: false, created_at: '2024-01-01T00:00:00Z' };
    const updatedTask = { id: 1, title: 'Task', completed: true, created_at: '2024-01-01T00:00:00Z' };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({ completed: true })
      .expect(200);

    expect(response.body).toEqual(updatedTask);
    expect(response.body.completed).toBe(true);
  });

  it('should update task title', async () => {
    const existingTask = { id: 1, title: 'Old Title', completed: false, created_at: '2024-01-01T00:00:00Z' };
    const updatedTask = { id: 1, title: 'New Title', completed: false, created_at: '2024-01-01T00:00:00Z' };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({ title: 'New Title' })
      .expect(200);

    expect(response.body).toEqual(updatedTask);
    expect(response.body.title).toBe('New Title');
  });

  it('should update both completed and title', async () => {
    const existingTask = { id: 1, title: 'Old Title', completed: false, created_at: '2024-01-01T00:00:00Z' };
    const updatedTask = { id: 1, title: 'New Title', completed: true, created_at: '2024-01-01T00:00:00Z' };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({ completed: true, title: 'New Title' })
      .expect(200);

    expect(response.body).toEqual(updatedTask);
    expect(response.body.completed).toBe(true);
    expect(response.body.title).toBe('New Title');
  });

  it('should preserve existing values when not provided', async () => {
    const existingTask = { id: 1, title: 'Original Title', completed: true, created_at: '2024-01-01T00:00:00Z' };
    const updatedTask = { id: 1, title: 'Original Title', completed: true, created_at: '2024-01-01T00:00:00Z' };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({})
      .expect(200);

    expect(response.body.title).toBe('Original Title');
    expect(response.body.completed).toBe(true);
  });

  it('should trim whitespace from title', async () => {
    const existingTask = { id: 1, title: 'Old', completed: false, created_at: '2024-01-01T00:00:00Z' };
    const updatedTask = { id: 1, title: 'Trimmed', completed: false, created_at: '2024-01-01T00:00:00Z' };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({ title: '  Trimmed  ' })
      .expect(200);

    expect(mockDb.query).toHaveBeenLastCalledWith(
      'UPDATE tasks SET completed = $1, title = $2 WHERE id = $3 RETURNING *',
      [false, 'Trimmed', 1]
    );
  });

  it('should convert completed to boolean', async () => {
    const existingTask = { id: 1, title: 'Task', completed: false, created_at: '2024-01-01T00:00:00Z' };
    const updatedTask = { id: 1, title: 'Task', completed: true, created_at: '2024-01-01T00:00:00Z' };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({ completed: 1 })
      .expect(200);

    expect(response.body.completed).toBe(true);
  });

  it('should return 404 when task does not exist', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });

    const response = await request(app)
      .patch('/tasks/999')
      .send({ completed: true })
      .expect(404);

    expect(response.body).toEqual({ error: 'Not found' });
  });

  it('should return 404 with correct error message', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });

    const response = await request(app)
      .patch('/tasks/999')
      .send({ title: 'New Title' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Not found');
  });

  it('should return 200 on successful update', async () => {
    const existingTask = { id: 1, title: 'Task', completed: false, created_at: '2024-01-01T00:00:00Z' };
    const updatedTask = { id: 1, title: 'Task', completed: true, created_at: '2024-01-01T00:00:00Z' };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({ completed: true });

    expect(response.status).toBe(200);
  });

  it('should return JSON content type', async () => {
    const existingTask = { id: 1, title: 'Task', completed: false, created_at: '2024-01-01T00:00:00Z' };
    const updatedTask = { id: 1, title: 'Task', completed: true, created_at: '2024-01-01T00:00:00Z' };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({ completed: true })
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
  });

  it('should return updated task with all properties', async () => {
    const existingTask = { id: 1, title: 'Task', completed: false, created_at: '2024-01-01T00:00:00Z' };
    const updatedTask = { id: 1, title: 'Updated', completed: true, created_at: '2024-01-01T00:00:00Z' };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({ completed: true, title: 'Updated' })
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('completed');
    expect(response.body).toHaveProperty('created_at');
  });

  it('should handle numeric id parameter', async () => {
    const existingTask = { id: 42, title: 'Task', completed: false, created_at: '2024-01-01T00:00:00Z' };
    const updatedTask = { id: 42, title: 'Task', completed: true, created_at: '2024-01-01T00:00:00Z' };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/42')
      .send({ completed: true })
      .expect(200);

    expect(response.body.id).toBe(42);
  });

  it('should accept additional fields in request body', async () => {
    const existingTask = { id: 1, title: 'Task', completed: false, created_at: '2024-01-01T00:00:00Z' };
    const updatedTask = { id: 1, title: 'Task', completed: true, created_at: '2024-01-01T00:00:00Z' };

    mockDb.query
      .mockResolvedValueOnce({ rows: [existingTask] })
      .mockResolvedValueOnce({ rows: [updatedTask] });

    const response = await request(app)
      .patch('/tasks/1')
      .send({ completed: true, extra: 'field', another: 123 })
      .expect(200);

    expect(response.body).toEqual(updatedTask);
  });
});
