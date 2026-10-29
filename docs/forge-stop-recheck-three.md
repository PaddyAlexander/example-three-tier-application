# Database Documentation

- The database uses PostgreSQL 17 Alpine with two main tables: users (id, email, created_at) and tasks (id, title, completed, created_at with automatic timestamp defaults)
- Database migrations are managed using node-pg-migrate version 8.0.4, with migration files in src/db/migrations that can be run with npm run migrate or npm run migrate:down
- The database runs in a Docker container with health checks (pg_isready) and persistent storage via a postgres_data volume, configured with credentials app/app/app for local development
