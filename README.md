# Movie Review App

A full-stack foundation for a movie review application. The current implementation includes project infrastructure, the application database schema, and a health check.

## Tech stack

- Frontend: Vue 3, Vite, TypeScript, Vue Router, Pinia, Axios, Tailwind CSS
- Backend: Node.js, Express, TypeScript, Prisma dependencies, Zod
- Database: PostgreSQL
- Infrastructure: Docker, Docker Compose, Nginx

## Current milestone

**M1 — Database Schema & Prisma Setup**

Authentication, movie discovery, and scoring APIs are not implemented yet.

## Project structure

```text
.
├── frontend/          # Vue single-page application and Nginx configuration
├── backend/           # Express API
├── docker-compose.yml
└── .env.example
```

## Environment setup

```bash
cp .env.example .env
```

The example values work for local Docker development. Replace placeholder secrets before deployment.

## Start with Docker

```bash
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080). Nginx serves the frontend and proxies `/api` requests to the backend.

PostgreSQL data is stored in a Docker volume. The backend applies committed Prisma migrations and idempotently seeds the reviewer account before Express starts.

```text
Email: reviewer@example.com
Password: Movie123!
```

## Health check

```bash
curl -i http://localhost:8080/api/health
```

The endpoint returns HTTP 200, `X-Test-Header: ayylmao`, and:

```json
{"success":true,"data":{"status":"ok"}}
```

## Run without Docker

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

Useful database commands from `backend/`:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```
