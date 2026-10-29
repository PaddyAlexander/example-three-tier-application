# Database Layer

- PostgreSQL 17 database with two tables managed by node-pg-migrate: users table (id serial primary key, email varchar(255) unique not null, created_at timestamp) and tasks table (id serial primary key, title varchar(500) not null, completed boolean default false, created_at timestamp)
- Database migrations are organized in timestamped files with up and down functions, automatically applied on startup by the migrate service which runs after the postgres service becomes healthy
- The API connects to PostgreSQL using the pg Pool with a connection string from the DATABASE_URL environment variable (postgres://app:app@postgres:5432/app in local development)
