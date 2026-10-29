# Local Development Documentation

- Local development uses Docker Compose to orchestrate four services: postgres (PostgreSQL 17 with health checks), migrate (runs node-pg-migrate up then exits), api (Express on port 3001), and web (Next.js on port 3000)
- Start the full stack with `docker compose up --build` which automatically runs migrations and makes the app available at http://localhost:3000, with the API accessible internally at http://api:3001
- The postgres_data volume persists database data between runs; use `docker compose down` to stop containers or `docker compose down -v` to stop and delete all data for a fresh start
