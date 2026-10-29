# API Documentation

- The API is built with Express.js and provides RESTful endpoints for task management including GET /tasks (with optional sorting by created_at, completed, or title), POST /tasks, PATCH /tasks/:id, and DELETE /tasks/:id
- Database connectivity is handled through a PostgreSQL connection pool using the pg library, configured via the DATABASE_URL environment variable
- The API runs on port 3001 by default and includes a /health endpoint that returns JSON status for monitoring purposes
