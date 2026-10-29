# [stop-test-1793253500] Database

The database tier is a PostgreSQL 17 instance that stores all application data persistently. It manages the schema through node-pg-migrate, which applies versioned migrations automatically on startup. The database is accessed by the API tier through a connection pool and is not directly exposed to the web tier. It runs in a Docker container with a persistent volume for data storage and can be deployed to Google Cloud SQL for production environments.
