# [stop-test-1793253500] Deployment Guide

This guide provides comprehensive instructions for deploying the three-tier application to production environments. The application supports both Docker Compose for local/staging deployments and Google Cloud Platform (GCP) with Terraform for production infrastructure.

## Overview

The three-tier application can be deployed in multiple ways:

1. **Local Development**: Docker Compose for local testing
2. **Staging**: Docker Compose on a server
3. **Production**: Google Cloud Platform with Terraform infrastructure-as-code

## Prerequisites

### For All Deployments

- Git repository access
- Docker and Docker Compose installed (for local/staging)
- Environment variables configured

### For GCP Production Deployment

- Google Cloud Project created
- `gcloud` CLI installed and authenticated
- Terraform 1.5+ installed
- Service account with appropriate permissions
- GCS bucket for Terraform state

## Local Development Deployment

### Using Docker Compose

The simplest way to run the entire application locally:

```bash
docker-compose up
```

This command:
1. Builds all images (postgres, api, web)
2. Starts PostgreSQL with health checks
3. Runs database migrations
4. Starts the API server
5. Starts the web application

Access the application at `http://localhost:3000`.

### Stopping the Application

```bash
docker-compose down
```

To also remove volumes (database data):

```bash
docker-compose down -v
```

### Viewing Logs

View all service logs:

```bash
docker-compose logs -f
```

View specific service logs:

```bash
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f postgres
```

## Staging Deployment

### Prerequisites

- Server with Docker and Docker Compose installed
- SSH access to the server
- Domain name (optional, for HTTPS)

### Deployment Steps

1. **Clone the repository:**

```bash
git clone https://github.com/PaddyAlexander/example-three-tier-application.git
cd example-three-tier-application
```

2. **Configure environment variables:**

Create a `.env` file:

```bash
DATABASE_URL=postgres://app:app@postgres:5432/app
API_URL=http://api:3001
PORT=3000
```

3. **Start the application:**

```bash
docker-compose up -d
```

4. **Verify deployment:**

```bash
curl http://localhost:3000
curl http://localhost:3001/health
```

### Updating Staging

To deploy new changes:

```bash
git pull origin main
docker-compose down
docker-compose up -d
```

## Production Deployment on GCP

### Infrastructure Overview

The production infrastructure includes:

- **VPC Network**: Private network for all resources
- **Cloud SQL**: Managed PostgreSQL 17 database
- **Cloud Run**: Serverless containers for API and Web
- **VPC Access Connector**: Enables Cloud Run to access VPC
- **Secret Manager**: Stores database connection strings
- **Service Account**: IAM permissions for Cloud Run

### Terraform Configuration

The infrastructure is defined in `src/infrastructure/`:

- `main.tf`: Main infrastructure resources
- `variables.tf`: Input variables
- `outputs.tf`: Output values
- `terraform.tfvars.example`: Example variable values

### Setup Steps

1. **Initialize GCP Project:**

```bash
gcloud projects create example-app
gcloud config set project example-app
gcloud auth application-default login
```

2. **Create GCS Bucket for Terraform State:**

```bash
gsutil mb gs://example-app-terraform-state
```

3. **Configure Terraform Variables:**

Copy the example file:

```bash
cp src/infrastructure/terraform.tfvars.example src/infrastructure/terraform.tfvars
```

Edit `terraform.tfvars` with your values:

```hcl
project_id = "your-gcp-project-id"
region     = "us-central1"
app_name   = "example-app"
environment = "prod"
```

4. **Initialize Terraform:**

```bash
cd src/infrastructure
terraform init \
  -backend-config="bucket=example-app-terraform-state" \
  -backend-config="prefix=prod"
```

5. **Review Infrastructure Plan:**

```bash
terraform plan
```

6. **Apply Infrastructure:**

```bash
terraform apply
```

This creates all GCP resources. Note the outputs for API and Web service URLs.

### Deploying Application Code

1. **Build and Push Container Images:**

```bash
# Build API image
docker build -t gcr.io/your-project/api:latest ./src/api
docker push gcr.io/your-project/api:latest

# Build Web image
docker build -t gcr.io/your-project/web:latest ./src/web
docker push gcr.io/your-project/web:latest
```

2. **Update Terraform Variables:**

Update `terraform.tfvars`:

```hcl
api_image = "gcr.io/your-project/api:latest"
web_image = "gcr.io/your-project/web:latest"
```

3. **Apply Changes:**

```bash
terraform apply
```

Cloud Run services automatically redeploy with new images.

### Accessing Production Services

After deployment, Terraform outputs the service URLs:

```bash
terraform output api_url
terraform output web_url
```

Access the web application via the web URL.

## Database Migrations in Production

### Running Migrations

Migrations run automatically when the migrate container starts in Docker Compose.

For GCP, create a Cloud Run job for migrations:

```bash
gcloud run jobs create migrate-db \
  --image=gcr.io/your-project/db:latest \
  --set-env-vars=DATABASE_URL=<connection-string>
```

Execute the migration job:

```bash
gcloud run jobs execute migrate-db
```

## Monitoring and Logs

### Docker Compose Logs

```bash
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f postgres
```

### GCP Cloud Logging

View API logs:

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=example-app-prod-api" --limit 50
```

View Web logs:

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=example-app-prod-web" --limit 50
```

### Cloud SQL Logs

```bash
gcloud sql operations list --instance=example-app-prod-postgres
```

## Scaling

### Docker Compose Scaling

Scale API service:

```bash
docker-compose up -d --scale api=3
```

### GCP Cloud Run Scaling

Update `terraform.tfvars`:

```hcl
api_max_instances = 10
web_max_instances = 5
```

Apply changes:

```bash
terraform apply
```

## Backup and Disaster Recovery

### GCP Cloud SQL Backups

Backups are configured in Terraform for production:

```hcl
backup_configuration {
  enabled    = var.environment == "prod"
  start_time = "03:00"
}
```

View backups:

```bash
gcloud sql backups list --instance=example-app-prod-postgres
```

Restore from backup:

```bash
gcloud sql backups restore <backup-id> \
  --backup-instance=example-app-prod-postgres
```

### Manual Database Backup

```bash
gcloud sql export sql example-app-prod-postgres \
  gs://example-app-backups/backup-$(date +%Y%m%d).sql
```

## Cleanup

### Remove Staging Deployment

```bash
docker-compose down -v
```

### Destroy GCP Infrastructure

```bash
cd src/infrastructure
terraform destroy
```

This removes all GCP resources. Ensure you have backups before destroying.

## Troubleshooting

### Docker Compose Issues

**Issue:** Containers fail to start

**Solution:** Check logs with `docker-compose logs`. Ensure ports 3000 and 3001 are available.

**Issue:** Database connection fails

**Solution:** Verify `DATABASE_URL` environment variable is set correctly.

### GCP Deployment Issues

**Issue:** Terraform apply fails

**Solution:** Check GCP project permissions and ensure service account has required roles.

**Issue:** Cloud Run services timeout

**Solution:** Increase timeout in Terraform configuration or check database connectivity.

**Issue:** Database migrations fail

**Solution:** Verify `DATABASE_URL` in Secret Manager and check migration file syntax.

## CI/CD Integration

### GitHub Actions

The repository includes a deployment workflow in `.github/workflows/deploy.yml` that:

1. Builds container images
2. Pushes to container registry
3. Triggers Terraform deployment

Configure GitHub secrets:

- `GCP_PROJECT_ID`: Your GCP project ID
- `GCP_SERVICE_ACCOUNT_KEY`: Service account JSON key

## Security Best Practices

- Use Secret Manager for sensitive data
- Enable VPC for private database access
- Use service accounts with minimal permissions
- Enable Cloud SQL SSL connections
- Regularly update container images
- Monitor logs for suspicious activity
- Use HTTPS for all external traffic
- Implement rate limiting on API endpoints
