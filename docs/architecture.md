# Architecture Overview

## Stack
- Backend: Flask (Python)
- Frontend: React (Vite)
- Database: PostgreSQL

## High-level flow
1. React app calls Flask endpoints under `/api`.
2. Flask reads/writes PostgreSQL using `psycopg`.
3. CORS allows the frontend dev origin during development.

## Planned domains (placeholder)
- Users
- Flights
- Reservations
- Payments

