# [stop-test-1793253500] Database Guide

This guide provides comprehensive instructions for working with the database tier of the three-tier application. The database tier uses PostgreSQL 17 with node-pg-migrate for schema management and versioning.

## Overview

The database tier is a PostgreSQL 17 instance that stores all application data. It uses node-pg-migrate for managing database schema migrations, ensuring consistent database structure across environments. The database runs in a Docker container and is accessible via connection strings.

## Getting Started

### Prerequisites

- PostgreSQL 17 or Docker installed
- Node.js 18+ for running migrations
- Environment variable `DATABASE_URL` set to your PostgreSQL connection string

### Installation

Navigate to the database directory and install dependencies:

```bash
cd src/db
npm install
```

### Connection String Format

The database connection string follows this format:

```
postgres://username:password@host:port/database
```

Example for local development:

```
postgres://app:app@localhost:5432/app
```

Example for Docker Compose:

```
postgres://app:app@postgres:5432/app
```

## Database Schema

### Tasks Table

The main table for storing task data:

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

**Columns:**

- `id`: Unique identifier (auto-incrementing)
- `title`: Task description (up to 500 characters)
- `completed`: Boolean flag indicating task completion status
- `created_at`: Timestamp of task creation (defaults to current time)

## Migrations

Migrations are managed using node-pg-migrate and stored in the `migrations/` directory.

### Migration Files

Each migration file is named with a timestamp prefix:

- `1718500000000_initial-schema.js`: Initial schema setup
- `1718500001000_create-tasks.js`: Creates the tasks table

### Running Migrations

To run all pending migrations:

```bash
npm run migrate
```

To rollback the last migration:

```bash
npm run migrate:down
```

### Creating New Migrations

To create a new migration file:

```bash
npx node-pg-migrate create <migration_name>
```

This creates a new file in the `migrations/` directory with `up` and `down` functions.

Example migration structure:

```javascript
exports.up = (pgm) => {
  pgm.createTable('new_table', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('new_table');
};
```

## Docker Setup

### Building the Database Image

The database tier includes a Dockerfile that sets up PostgreSQL with migrations:

```bash
docker build -t example-db ./src/db
```

### Running with Docker Compose

The complete application stack can be run with Docker Compose:

```bash
docker-compose up
```

This starts:
1. PostgreSQL container
2. Migration container (runs migrations automatically)
3. API container (depends on migrations)
4. Web container (depends on API)

### Docker Compose Configuration

The `docker-compose.yml` defines:

- **postgres service**: PostgreSQL 17 Alpine image with health checks
- **migrate service**: Runs migrations on startup
- **api service**: Depends on successful migration completion
- **web service**: Depends on API service

## Database Operations

### Connecting to the Database

Using `psql` command-line tool:

```bash
psql postgres://app:app@localhost:5432/app
```

### Querying Tasks

List all tasks:

```sql
SELECT * FROM tasks ORDER BY created_at DESC;
```

Count completed tasks:

```sql
SELECT COUNT(*) FROM tasks WHERE completed = true;
```

Get tasks by completion status:

```sql
SELECT * FROM tasks WHERE completed = false ORDER BY created_at DESC;
```

### Inserting Test Data

Insert a sample task:

```sql
INSERT INTO tasks (title, completed) VALUES ('Sample task', false);
```

### Updating Tasks

Mark a task as completed:

```sql
UPDATE tasks SET completed = true WHERE id = 1;
```

Update task title:

```sql
UPDATE tasks SET title = 'Updated title' WHERE id = 1;
```

### Deleting Tasks

Delete a specific task:

```sql
DELETE FROM tasks WHERE id = 1;
```

Clear all tasks:

```sql
DELETE FROM tasks;
```

## Performance Considerations

### Indexes

The `id` column is indexed as the primary key. For large datasets, consider adding indexes:

```sql
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
```

### Connection Pooling

The API tier uses connection pooling via the `pg` library. The default pool size is 10 connections.

### Query Optimization

- Use `WHERE` clauses to filter results
- Order results by indexed columns when possible
- Limit result sets for large tables

## Backup and Recovery

### Backing Up the Database

Using `pg_dump`:

```bash
pg_dump postgres://app:app@localhost:5432/app > backup.sql
```

### Restoring from Backup

Using `psql`:

```bash
psql postgres://app:app@localhost:5432/app < backup.sql
```

### Docker Volume Persistence

The Docker Compose setup uses a named volume `postgres_data` for persistent storage:

```yaml
volumes:
  postgres_data:
```

Data persists even if containers are stopped or removed.

## Troubleshooting

### Connection Refused

**Issue:** Cannot connect to PostgreSQL

**Solution:** Ensure PostgreSQL is running and the connection string is correct. Check host, port, username, and password.

### Migration Failures

**Issue:** Migrations fail to run

**Solution:** Check that `DATABASE_URL` is set correctly and the database is accessible. Review migration file syntax.

### Disk Space Issues

**Issue:** Database runs out of disk space

**Solution:** Check available disk space with `df -h`. Consider archiving old data or increasing volume size.

### Slow Queries

**Issue:** Database queries are slow

**Solution:** Add indexes to frequently queried columns. Use `EXPLAIN ANALYZE` to identify bottlenecks.

## Development Tips

- Use `psql` for interactive database exploration
- Test migrations in development before production
- Keep migration files small and focused
- Document schema changes in migration comments
- Use transactions for data consistency
- Monitor connection pool usage in production
