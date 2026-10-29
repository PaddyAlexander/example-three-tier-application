# Note 4: Database

The database layer uses PostgreSQL 17 with migrations managed by node-pg-migrate. The schema is defined in migration files located in `src/db/migrations/`.

- **Tasks Table**: Contains columns for `id` (serial primary key), `title` (varchar 500, required), `completed` (boolean, default false), and `created_at` (timestamp, auto-set to now)
- **Migrations**: Managed through node-pg-migrate with scripts `npm run migrate` (apply) and `npm run migrate:down` (rollback)
- **Connection**: Uses the `pg` library to connect via `DATABASE_URL` environment variable; in Docker Compose, the database is accessible at `postgres://app:app@postgres:5432/app`
