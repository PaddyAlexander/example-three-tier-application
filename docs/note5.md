# Note 5: Local Development

The application runs locally using Docker Compose, which orchestrates all three tiers (PostgreSQL, Express API, and Next.js frontend) with automatic startup sequencing and health checks.

- **Docker Compose Setup**: Run `docker compose up --build` to start all services; the stack automatically applies database migrations and waits for each service to be healthy before starting the next one
- **Access Points**: The frontend is exposed on `http://localhost:3000`, the API runs internally on port 3001 (accessible from the web container), and PostgreSQL runs on port 5432 (internal only)
- **Development Workflow**: After code changes, run `docker compose up --build` to rebuild images; use `docker compose down` to stop containers (keeping data) or `docker compose down -v` to delete all data including the database volume
