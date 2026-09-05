# PeoplePay360

## Structure
```
backend/   Express + Prisma + Postgres (:4000)
frontend/  React Vite + Router + Tailwind + axios (:5173)
```

## Backend setup
```bash
cd peoplepay360/backend
cp .env.example .env
npm install
npx prisma generate --schema=./src/prisma/schema.prisma
npx prisma migrate dev --schema=./src/prisma/schema.prisma
npm run dev
```
Health: `GET http://localhost:4000/health` → `{ status: "ok" }`

## Frontend setup
```bash
cd peoplepay360/frontend
npm install
npm run dev
```

## Run both (from repo root)
```bash
npm --prefix peoplepay360/backend run dev &
npm --prefix peoplepay360/frontend run dev
```
