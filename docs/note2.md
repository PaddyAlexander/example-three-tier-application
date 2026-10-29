# Note 2: API Routes

The Express API provides RESTful endpoints for managing tasks. It runs on port 3001 and uses the `pg` library to connect to PostgreSQL.

- **GET /health**: Health check endpoint that returns `{ status: 'ok' }`
- **GET /tasks**: Lists all tasks from the database, ordered by creation date
- **POST /tasks**: Creates a new task with a required `title` field; returns the created task with auto-generated `id` and `created_at`
- **PATCH /tasks/:id**: Updates a task by ID, allowing changes to `completed` status or `title` field

For local development details, see note5.md.
