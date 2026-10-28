const request = require('supertest');
const express = require('express');

// Mock the db module
jest.mock('../db');

// Import the app setup
const app = express();
app.use(express.json());

// GET /health — health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

describe('GET /health', () => {
  it('should return status ok', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should return JSON content type', async () => {
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
  });
});
