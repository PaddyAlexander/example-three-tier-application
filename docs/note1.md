# Note 1: Application Overview

This note is part of the Forge documentation demo.

This is a three-tier web application that demonstrates a complete stack architecture with a frontend, API, and database.

- **Architecture**: Browser → Next.js frontend (port 3000) → Express API (port 3001) → PostgreSQL database
- **Purpose**: A task manager (to-do list) application that shows how the three tiers communicate with each other
- **Deployment**: Runs locally with Docker Compose and deploys to Google Cloud Platform (Cloud Run + Cloud SQL) via Terraform
