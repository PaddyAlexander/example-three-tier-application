# [stop-test-1793253500] Troubleshooting Guide

This guide provides solutions for common issues encountered when developing, deploying, and running the three-tier application. It covers problems across all tiers: web, API, and database.

## General Troubleshooting Steps

Before diving into specific issues, try these general steps:

1. **Check logs**: Review application logs for error messages
2. **Verify connectivity**: Ensure all services can communicate
3. **Check environment variables**: Confirm all required variables are set
4. **Restart services**: Stop and restart the affected service
5. **Clear cache**: Remove node_modules and reinstall dependencies

## Web Tier Issues

### Application Won't Start

**Symptoms:** `npm run dev` fails or hangs

**Solutions:**

1. Clear Next.js cache:
```bash
cd src/web
rm -rf .next
npm install
npm run dev
```

2. Check Node.js version:
```bash
node --version  # Should be 18+
```

3. Check port availability:
```bash
lsof -i :3000  # Check if port 3000 is in use
```

4. Verify environment variables:
```bash
echo $API_URL  # Should be set to API endpoint
```

### Tasks Not Loading

**Symptoms:** "Failed to fetch tasks" error in browser

**Solutions:**

1. Verify API is running:
```bash
curl http://localhost:3001/health
```

2. Check API_URL configuration:
```bash
# In src/web, check that API_URL is correct
echo $API_URL
```

3. Check browser console for CORS errors:
   - Open DevTools (F12)
   - Check Console tab for error messages
   - Verify API allows requests from web origin

4. Check network tab:
   - Open DevTools Network tab
   - Attempt to load tasks
   - Check request/response details

### Styling Issues

**Symptoms:** Page looks unstyled or broken

**Solutions:**

1. Rebuild Tailwind CSS:
```bash
cd src/web
npm install
npm run build
npm start
```

2. Clear browser cache:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache in DevTools

3. Check Tailwind configuration:
```bash
cat tailwind.config.ts  # Verify configuration is correct
```

### Page Refresh Loses State

**Symptoms:** Tasks disappear after page refresh

**Solutions:**

1. Verify `revalidatePath('/')` is called in server actions:
```bash
grep -n "revalidatePath" src/web/app/actions.ts
```

2. Check that server actions are properly exported:
```bash
grep -n "use server" src/web/app/actions.ts
```

3. Ensure API is persisting data to database

## API Tier Issues

### API Won't Start

**Symptoms:** `npm start` fails or port 3001 not accessible

**Solutions:**

1. Check Node.js version:
```bash
node --version  # Should be 18+
```

2. Verify port availability:
```bash
lsof -i :3001  # Check if port 3001 is in use
```

3. Check database connection:
```bash
echo $DATABASE_URL  # Should be set
```

4. Install dependencies:
```bash
cd src/api
npm install
npm start
```

### Database Connection Fails

**Symptoms:** "Error: connect ECONNREFUSED" or similar

**Solutions:**

1. Verify DATABASE_URL format:
```bash
# Should be: postgres://user:password@host:port/database
echo $DATABASE_URL
```

2. Test database connectivity:
```bash
psql $DATABASE_URL -c "SELECT 1"
```

3. Check if PostgreSQL is running:
```bash
# For Docker
docker ps | grep postgres

# For local PostgreSQL
pg_isready -h localhost -p 5432
```

4. Verify credentials:
   - Username: app
   - Password: app
   - Database: app
   - Host: localhost (local) or postgres (Docker)

### Health Check Fails

**Symptoms:** `/health` endpoint returns error

**Solutions:**

1. Check API logs:
```bash
npm run dev  # Run in development to see logs
```

2. Verify API is listening:
```bash
curl http://localhost:3001/health
```

3. Check for port conflicts:
```bash
lsof -i :3001
```

### Tasks Endpoint Returns 500 Error

**Symptoms:** `GET /tasks` returns HTTP 500

**Solutions:**

1. Check database connection:
```bash
psql $DATABASE_URL -c "SELECT * FROM tasks;"
```

2. Verify tasks table exists:
```bash
psql $DATABASE_URL -c "\dt tasks"
```

3. Check API logs for detailed error:
```bash
npm run dev  # Run in development mode
curl http://localhost:3001/tasks  # Trigger error
```

4. Verify migrations ran:
```bash
psql $DATABASE_URL -c "SELECT * FROM pgmigrations;"
```

### Creating Tasks Fails

**Symptoms:** POST /tasks returns error

**Solutions:**

1. Verify request format:
```bash
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task"}'
```

2. Check title validation:
   - Title must be non-empty string
   - Title must be less than 500 characters

3. Verify database has write permissions:
```bash
psql $DATABASE_URL -c "INSERT INTO tasks (title) VALUES ('test');"
```

## Database Tier Issues

### Migrations Won't Run

**Symptoms:** Migration container fails or migrations don't apply

**Solutions:**

1. Check migration file syntax:
```bash
cat src/db/migrations/*.js  # Review migration files
```

2. Verify DATABASE_URL:
```bash
echo $DATABASE_URL
```

3. Test database connection:
```bash
psql $DATABASE_URL -c "SELECT 1"
```

4. Check migration status:
```bash
cd src/db
npm run migrate  # Run migrations manually
```

5. Review migration logs:
```bash
docker-compose logs migrate  # For Docker
```

### Database Connection Timeout

**Symptoms:** "Connection timeout" or "ETIMEDOUT" errors

**Solutions:**

1. Check PostgreSQL is running:
```bash
docker ps | grep postgres
```

2. Verify network connectivity:
```bash
ping postgres  # For Docker
ping localhost  # For local
```

3. Check firewall rules:
```bash
# For local PostgreSQL
sudo ufw allow 5432/tcp
```

4. Increase connection timeout:
```bash
# In API code, increase timeout value
```

### Database Disk Full

**Symptoms:** "No space left on device" errors

**Solutions:**

1. Check disk usage:
```bash
df -h
du -sh /var/lib/postgresql/data
```

2. Archive old data:
```bash
psql $DATABASE_URL -c "DELETE FROM tasks WHERE created_at < NOW() - INTERVAL '1 year';"
```

3. Increase volume size:
```bash
# For Docker, modify docker-compose.yml volume size
```

### Slow Queries

**Symptoms:** Tasks load slowly or API times out

**Solutions:**

1. Check query performance:
```bash
psql $DATABASE_URL -c "EXPLAIN ANALYZE SELECT * FROM tasks;"
```

2. Add indexes:
```bash
psql $DATABASE_URL -c "CREATE INDEX idx_tasks_completed ON tasks(completed);"
```

3. Check connection pool:
```bash
# Verify pool size in API code
```

4. Monitor active connections:
```bash
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"
```

## Docker Compose Issues

### Containers Won't Start

**Symptoms:** `docker-compose up` fails

**Solutions:**

1. Check Docker daemon:
```bash
docker ps  # Should list running containers
```

2. Review compose file:
```bash
docker-compose config  # Validate syntax
```

3. Check logs:
```bash
docker-compose logs  # View all logs
```

4. Rebuild images:
```bash
docker-compose build --no-cache
docker-compose up
```

### Port Already in Use

**Symptoms:** "Address already in use" error

**Solutions:**

1. Find process using port:
```bash
lsof -i :3000  # For port 3000
lsof -i :3001  # For port 3001
lsof -i :5432  # For port 5432
```

2. Kill process:
```bash
kill -9 <PID>
```

3. Or use different ports:
```bash
docker-compose -f docker-compose.yml -p myapp up
```

### Volume Permission Issues

**Symptoms:** "Permission denied" errors

**Solutions:**

1. Check volume ownership:
```bash
docker volume ls
docker volume inspect postgres_data
```

2. Fix permissions:
```bash
docker-compose down -v
docker-compose up  # Recreate volumes
```

## Network Issues

### Services Can't Communicate

**Symptoms:** "Connection refused" between services

**Solutions:**

1. Verify Docker network:
```bash
docker network ls
docker network inspect <network-name>
```

2. Check service names:
   - API should be accessible at `http://api:3001` in Docker
   - Database at `postgres:5432`

3. Test connectivity:
```bash
docker-compose exec web curl http://api:3001/health
```

### CORS Errors

**Symptoms:** "CORS policy" errors in browser console

**Solutions:**

1. Verify API_URL in web configuration:
```bash
echo $API_URL
```

2. Check API CORS headers:
   - API should allow requests from web origin
   - Verify `Access-Control-Allow-Origin` header

3. For development, use same origin:
```bash
# Web: http://localhost:3000
# API: http://localhost:3001
```

## Performance Issues

### High CPU Usage

**Symptoms:** Application is slow or unresponsive

**Solutions:**

1. Check running processes:
```bash
docker stats  # For Docker
top  # For local
```

2. Profile application:
```bash
npm run dev  # Run with logging
```

3. Reduce load:
   - Limit concurrent requests
   - Optimize database queries
   - Add caching

### High Memory Usage

**Symptoms:** Application crashes or becomes unresponsive

**Solutions:**

1. Check memory usage:
```bash
docker stats
free -h
```

2. Increase memory limits:
```bash
# In docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 1G
```

3. Optimize code:
   - Reduce object allocations
   - Clear caches periodically
   - Use streaming for large data

## Getting Help

### Collect Diagnostic Information

When reporting issues, gather:

1. **Logs**: Full error messages and stack traces
2. **Environment**: OS, Node.js version, Docker version
3. **Configuration**: Environment variables (sanitized)
4. **Steps to reproduce**: Exact steps to trigger the issue
5. **Expected vs actual**: What should happen vs what happens

### Debug Mode

Enable debug logging:

```bash
# For Node.js
DEBUG=* npm start

# For Docker
docker-compose logs -f --tail=100
```

### Common Log Locations

- **Web**: Browser console (F12)
- **API**: stdout when running `npm start`
- **Database**: Docker logs or PostgreSQL log file
- **Docker**: `docker-compose logs`

## Prevention Tips

- Keep dependencies updated: `npm update`
- Use environment variable templates
- Test locally before deploying
- Monitor application logs regularly
- Backup database regularly
- Document custom configurations
- Use version control for all changes
