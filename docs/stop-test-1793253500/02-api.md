# [stop-test-1793253500] API

The API tier is an Express.js REST service running on Node.js 22 that handles all business logic and data operations. It provides endpoints for managing tasks, including listing, creating, and updating tasks. The API communicates with the PostgreSQL database through a connection pool and exposes a clean REST interface that the web frontend consumes. It runs on port 3001 internally within the Docker network and is not directly exposed to the host.
