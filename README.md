# Acquisitions API

Express.js API with authentication, Drizzle ORM, and Neon PostgreSQL.

## Dockerized Environments

This project supports two Docker workflows:

- **Development:** the app runs with Neon Local, which proxies to Neon and creates ephemeral database branches.
- **Production:** the app runs by itself and connects directly to a managed Neon Cloud database URL.

## Environment Switching

Development uses Neon Local inside the Docker Compose network:

```env
DATABASE_URL=postgresql://neon:npg@neon-local:5432/neondb?sslmode=require
NEON_LOCAL=true
NEON_FETCH_ENDPOINT=http://neon-local:5432/sql
```

Production uses the real Neon Cloud connection string:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/neondb?sslmode=require&channel_binding=require
NEON_LOCAL=false
```

The app reads `NEON_LOCAL=true` in `src/config/database.js` and configures the Neon serverless driver to send HTTP queries through the Neon Local proxy.

## Local Development With Neon Local

1. Fill in `.env.development`:

```env
NEON_API_KEY=your_neon_api_key
NEON_PROJECT_ID=your_neon_project_id
JWT_SECRET=your_local_jwt_secret
ARCJET_KEY=your_arcjet_key
```

`PARENT_BRANCH_ID` is optional. If omitted, Neon Local creates ephemeral branches from your project's default branch. The branch is deleted when the Neon Local container stops because `DELETE_BRANCH=true` is set in `docker-compose.dev.yml`.

2. Start the development stack:

```sh
docker compose --env-file .env.development -f docker-compose.dev.yml up --build
```

3. Run database migrations against the Neon Local branch:

```sh
docker compose --env-file .env.development -f docker-compose.dev.yml exec app npm run db:migrate
```

4. Open the API:

```sh
curl http://localhost:3000/health
```

The app container connects to Neon Local with:

```text
postgresql://neon:npg@neon-local:5432/neondb?sslmode=require
```

From your host machine, Neon Local is exposed on:

```text
localhost:5432
```

## Production With Neon Cloud

Production does **not** run Neon Local. Neon is a managed serverless database, so the production Compose file only runs the app container and injects the Neon Cloud URL through `.env.production`.

1. Fill in `.env.production`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your_production_jwt_secret
ARCJET_KEY=your_production_arcjet_key
```

2. Run the production container:

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

3. Run migrations against production only when intended:

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml exec app npm run db:migrate
```

## Useful Commands

```sh
# Development
docker compose --env-file .env.development -f docker-compose.dev.yml up --build

# Stop development and delete the ephemeral Neon Local branch
docker compose --env-file .env.development -f docker-compose.dev.yml down

# Production
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d

# Logs
docker compose -f docker-compose.dev.yml logs -f app
```

## Notes

- Do not commit real `.env` files. `.env`, `.env.*`, and `.neon_local` are ignored.
- Neon Local needs `NEON_API_KEY` and `NEON_PROJECT_ID`.
- Production should use a Neon Cloud `DATABASE_URL`; no local database proxy is used.
- The app listens on port `3000` by default.
