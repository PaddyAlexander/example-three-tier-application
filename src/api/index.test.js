// Unit test for task creation endpoint
const request = require('supertest');
const app = require('./index');
const db = require('./db');

// Mock the database module
jest.mock('./db');

describe('POST /tasks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a task with valid title', async () => {
    const mockTask = {
      id: 1,
      title: 'Buy groceries',
      completed: false,
      created_at: new Date().toISOString()
    };

    db.query.mockResolvedValue({ rows: [mockTask] });

    const response = await request(app)
      .post('/tasks')
      .send({ title: 'Buy groceries' })
      .expect(201);

    expect(response.body).toEqual(mockTask);
    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      ['Buy groceries']
    );
  });

  it('trims whitespace from title', async () => {
    const mockTask = {
      id: 2,
      title: 'Clean house',
      completed: false,
      created_at: new Date().toISOString()
    };

    db.query.mockResolvedValue({ rows: [mockTask] });

    await request(app)
      .post('/tasks')
      .send({ title: '  Clean house  ' })
      .expect(201);

    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      ['Clean house']
    );
  });

  it('returns 400 when title is missing', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({})
      .expect(400);

    expect(response.body).toEqual({ error: 'title is required' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 400 when title is empty string', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: '' })
      .expect(400);

    expect(response.body).toEqual({ error: 'title is required' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 400 when title is only whitespace', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: '   ' })
      .expect(400);

    expect(response.body).toEqual({ error: 'title is required' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 400 when title is not a string', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: 123 })
      .expect(400);

    expect(response.body).toEqual({ error: 'title is required' });
    expect(db.query).not.toHaveBeenCalled();
  });
});
