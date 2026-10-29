# Local Development

- Docker Compose orchestrates four services in dependency order: postgres (PostgreSQL 17-alpine with health checks), migrate (runs node-pg-migrate up after postgres is healthy), api (Express on port 3001 after migrations complete), and web (Next.js on port 3000 exposed to host)
- The stack starts with `docker compose up --build` and serves the application at http://localhost:3000, with automatic rebuilds when code changes by running the same command
- Data persists in a named volume (postgres_data) that survives container restarts but can be deleted with `docker compose down -v` to reset the database
- Development scripts include `npm run dev` for hot-reload mode (node --watch for API, next dev for web) and the API uses Node.js 22 while the web frontend uses TypeScript 5 with Next.js 16 and React 19
