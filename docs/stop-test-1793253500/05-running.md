# [stop-test-1793253500] Running

To run the application locally, use Docker Compose with `docker compose up --build`. This command starts all four services in order: PostgreSQL database, migrations, Express API, and Next.js web frontend. The application is then accessible at http://localhost:3000. For production deployment to Google Cloud Platform, use Terraform in the `src/infrastructure/` directory to provision Cloud Run services and Cloud SQL. The application can be stopped with `docker compose down` and cleaned up completely with `docker compose down -v`.
