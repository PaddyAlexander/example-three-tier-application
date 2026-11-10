# Repo file overview (cmpx-80-qa-20261110)

One line per file read.

- `README.md`: Describes the three-tier example app (Next.js 16, Express 5, PostgreSQL 17, node-pg-migrate, Terraform for GCP) and how to run it with `docker compose up --build`.
- `docker-compose.yml`: Runs postgres, a one-shot migrate job, the internal API (port 3001) and the web app (port 3000) locally.
- `src/api/index.js`: Express app exposing `/health` and the `/tasks` routes (list with sort/order, create, update).
- `src/api/db.js`: Creates and exports a `pg` connection pool from `DATABASE_URL`.
- `src/api/Dockerfile`: Builds the API image on node:22-alpine, installs production dependencies and runs `node index.js`.
- `src/api/package.json`: Declares the API package, its dependencies (express, pg) and the start/dev scripts.
- `src/db/Dockerfile`: Builds the migration image that runs `node-pg-migrate up` against Postgres.
- `src/db/migrations/1718500000000_initial-schema.js`: Migration that creates the `users` table (and drops it on down).
- `src/db/migrations/1718500001000_create-tasks.js`: Migration that creates the `tasks` table (and drops it on down).
- `src/db/package.json`: Declares the migration package with node-pg-migrate and the `migrate` / `migrate:down` scripts.
- `src/infrastructure/main.tf`: Terraform base setup: GCS backend, google/random providers, VPC, subnet and private service networking for Cloud SQL.
- `src/infrastructure/migration.tf`: Defines the `db_image` variable and a Cloud Run job that runs database migrations using the `DATABASE_URL` secret.
- `src/infrastructure/outputs.tf`: Terraform outputs such as web and API URLs, DB details, VPC name and service account.
- `src/infrastructure/variables.tf`: Terraform input variables for the infrastructure.
- `src/web/Dockerfile`: Multi-stage build of the Next.js app into a standalone production image served with `node server.js` on port 3000.
- `src/web/package.json`: Declares the web package with Next.js, React, Tailwind, ESLint and TypeScript, plus dev/build/start/lint scripts.
- `src/web/app/actions.ts`: Next.js server actions that call the API to fetch, create, toggle and delete tasks.
- `src/web/app/TaskList.tsx`: Client component that renders the task list with search, status filter, sorting (saved in localStorage), toggle and delete.
- `src/web/app/page.tsx`: Home page that loads tasks on the server and shows the add-task form and the task list.
