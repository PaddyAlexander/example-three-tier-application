// API entry point
const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// GET /tasks — list all tasks with optional sorting
app.get('/tasks', async (req, res) => {
  const { sort = 'created_at', order = 'asc' } = req.query;
  
  // Validate sort field
  const validSortFields = ['created_at', 'completed', 'title'];
  const sortField = validSortFields.includes(sort) ? sort : 'created_at';
  
  // Validate order
  const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  
  const { rows } = await db.query(
    `SELECT * FROM tasks ORDER BY ${sortField} ${sortOrder}, id ASC`
  );
  res.json(rows);
});

/**
 * POST /tasks — create a task.
 * Expects a JSON body with a non-empty string `title` (trimmed before saving).
 * Responds 201 with the created task, or 400 if the title is missing or blank.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const { rows } = await db.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title.trim()]
  );
  res.status(201).json(rows[0]);
});

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

// DELETE /tasks/:id — delete a task
app.delete('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  await db.query('DELETE FROM tasks WHERE id = $1', [id]);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
