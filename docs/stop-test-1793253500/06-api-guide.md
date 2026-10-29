# [stop-test-1793253500] API Guide

This guide provides detailed instructions for working with the API tier of the three-tier application. The API is a Node.js/Express server that manages task data and communicates with the PostgreSQL database.

## Overview

The API tier serves as the backend for the application, exposing RESTful endpoints for task management. It runs on port 3001 by default and uses Express.js for routing and middleware, with the `pg` library for database connectivity.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running and accessible
- Environment variable `DATABASE_URL` set to your PostgreSQL connection string

### Installation

Navigate to the API directory and install dependencies:

```bash
cd src/api
npm install
```

### Running the API

For development with auto-reload:

```bash
npm run dev
```

For production:

```bash
npm start
```

The API will listen on the port specified by the `PORT` environment variable (default: 3001).

## API Endpoints

### Health Check

**Endpoint:** `GET /health`

Returns the health status of the API.

**Response:**
```json
{
  "status": "ok"
}
```

**Example:**
```bash
curl http://localhost:3001/health
```

### List All Tasks

**Endpoint:** `GET /tasks`

Retrieves all tasks from the database, ordered by creation date.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "completed": false,
    "created_at": "2024-06-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "title": "Write documentation",
    "completed": true,
    "created_at": "2024-06-15T11:00:00.000Z"
  }
]
```

**Example:**
```bash
curl http://localhost:3001/tasks
```

### Create a Task

**Endpoint:** `POST /tasks`

Creates a new task with the provided title.

**Request Body:**
```json
{
  "title": "Learn Express.js"
}
```

**Response:** (HTTP 201 Created)
```json
{
  "id": 3,
  "title": "Learn Express.js",
  "completed": false,
  "created_at": "2024-06-15T12:00:00.000Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Express.js"}'
```

**Validation:** The title must be a non-empty string. Empty or missing titles return HTTP 400.

### Update a Task

**Endpoint:** `PATCH /tasks/:id`

Updates an existing task by ID. You can update the title, completion status, or both.

**Request Body (examples):**
```json
{
  "completed": true
}
```

Or:
```json
{
  "title": "Updated task name",
  "completed": false
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Updated task name",
  "completed": true,
  "created_at": "2024-06-15T10:30:00.000Z"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:3001/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

**Error Handling:** If the task ID does not exist, returns HTTP 404 with error message.

## Database Connection

The API connects to PostgreSQL using the `pg` library. The connection string is read from the `DATABASE_URL` environment variable. The pool is configured with default settings and handles connection management automatically.

## Error Handling

The API returns appropriate HTTP status codes:
- **200 OK:** Successful GET or PATCH request
- **201 Created:** Successful POST request
- **400 Bad Request:** Invalid input (e.g., missing title)
- **404 Not Found:** Resource does not exist

## Middleware

The API uses Express middleware:
- `express.json()`: Parses incoming JSON request bodies

## Development Tips

- Use `npm run dev` for development with automatic restart on file changes
- Test endpoints with `curl` or tools like Postman
- Check logs in the console for debugging
- Ensure `DATABASE_URL` is set before starting the server
