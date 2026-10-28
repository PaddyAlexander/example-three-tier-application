const request = require('supertest');
const express = require('express');

// Mock database
const mockDb = {
  query: jest.fn(),
};

// Create app for testing
const app = express();
app.use(express.json());

app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const { rows } = await mockDb.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title.trim()]
  );
  res.status(201).json(rows[0]);
});

describe('POST /tasks', () => {
  beforeEach(() => {
    mockDb.query.mockClear();
  });

  it('should create a task with valid title', async () => {
    const newTask = { id: 1, title: 'New Task', completed: false, created_at: '2024-01-01T00:00:00Z' };
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

  it('should return 201 status code on successful creation', async () => {
    const newTask = { id: 1, title: 'Test', completed: false, created_at: '2024-01-01T00:00:00Z' };
    mockDb.query.mockResolvedValue({ rows: [newTask] });

    const response = await request(app)
      .post('/tasks')
      .send({ title: 'Test' });

    expect(response.status).toBe(201);
  });

  it('should return created task with all properties', async () => {
    const newTask = { id: 1, title: 'Task', completed: false, created_at: '2024-01-01T00:00:00Z' };
    mockDb.query.mockResolvedValue({ rows: [newTask] });

    const response = await request(app)
      .post('/tasks')
      .send({ title: 'Task' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('completed');
    expect(response.body).toHaveProperty('created_at');
  });

  it('should trim whitespace from title', async () => {
    const newTask = { id: 1, title: 'Trimmed Task', completed: false, created_at: '2024-01-01T00:00:00Z' };
    mockDb.query.mockResolvedValue({ rows: [newTask] });

    const response = await request(app)
      .post('/tasks')
      .send({ title: '  Trimmed Task  ' })
      .expect(201);

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
  });

  it('should return 400 when title is null', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: null })
      .expect(400);

    expect(response.body).toEqual({ error: 'title is required' });
  });

  it('should return 400 when title is empty string', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: '' })
      .expect(400);

    expect(response.body).toEqual({ error: 'title is required' });
  });

  it('should return 400 when title is only whitespace', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: '   ' })
      .expect(400);

    expect(response.body).toEqual({ error: 'title is required' });
  });

  it('should return 400 when title is not a string', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: 123 })
      .expect(400);

    expect(response.body).toEqual({ error: 'title is required' });
  });

  it('should return 400 when title is an array', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: ['Task'] })
      .expect(400);

    expect(response.body).toEqual({ error: 'title is required' });
  });

  it('should return 400 when title is an object', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: { text: 'Task' } })
      .expect(400);

    expect(response.body).toEqual({ error: 'title is required' });
  });

  it('should return JSON content type', async () => {
    const newTask = { id: 1, title: 'Task', completed: false, created_at: '2024-01-01T00:00:00Z' };
    mockDb.query.mockResolvedValue({ rows: [newTask] });

    const response = await request(app)
      .post('/tasks')
      .send({ title: 'Task' })
      .expect('Content-Type', /json/);

    expect(response.status).toBe(201);
  });

  it('should accept additional fields in request body', async () => {
    const newTask = { id: 1, title: 'Task', completed: false, created_at: '2024-01-01T00:00:00Z' };
    mockDb.query.mockResolvedValue({ rows: [newTask] });

    const response = await request(app)
      .post('/tasks')
      .send({ title: 'Task', extra: 'field', another: 123 })
      .expect(201);

    expect(response.body).toEqual(newTask);
  });
});
