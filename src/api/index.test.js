// Test suite for the API endpoints. Tests the health check endpoint and the tasks API,
// including successful responses, empty results, and error handling with a mocked database.

const request = require('supertest');
const app = require('./index');
const db = require('./db');

// Mock the database module
jest.mock('./db');

describe('API Endpoints', () => {
  afterEach(() => {
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
    it('should return an empty array when no tasks exist', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM tasks ORDER BY created_at ASC');
    });

    it('should return all tasks ordered by created_at', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', completed: false, created_at: '2024-01-01' },
        { id: 2, title: 'Task 2', completed: true, created_at: '2024-01-02' },
      ];
      db.query.mockResolvedValueOnce({ rows: mockTasks });

      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body).toEqual(mockTasks);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM tasks ORDER BY created_at ASC');
    });

    it('should handle database errors gracefully', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection failed'));

      await request(app)
        .get('/tasks')
        .expect(500);
    });
  });
});
