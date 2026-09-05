# React + Express + Postgres Template

## Structure
```
client/         React (Vite)
server/src/     Express API + pg Pool
```

## Setup
1. Postgres running locally, DB created:
   ```sql
   CREATE DATABASE appdb;
   ```
2. Configure env:
   ```bash
   cp server/.env.example server/.env
   ```
3. Install + run:
   ```bash
   npm run install:all
   npm run dev:server   # :5000
   npm run dev:client   # :5173 (proxies /api -> :5000)
   ```

## Endpoints
- `GET /api/health` — API check
- `GET /api/db-health` — Postgres `SELECT NOW()`
- `GET /api/users` — list users
- `POST /api/users` `{name, email}` — create user

DB connection: `server/src/db.js` uses `pg.Pool` with `DATABASE_URL`. Table `users` auto-created on boot.
