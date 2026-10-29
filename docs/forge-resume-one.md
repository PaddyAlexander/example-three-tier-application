# API Layer

- The Express API runs on port 3001 and provides five REST endpoints: GET /health, GET /tasks (with optional sort and order query parameters), POST /tasks, PATCH /tasks/:id, and DELETE /tasks/:id
- Task retrieval supports sorting by created_at, completed, or title fields with ascending or descending order via query parameters
- The API validates input data including required title fields and returns appropriate HTTP status codes (201 for creation, 404 for not found, 400 for validation errors, 204 for successful deletion)
