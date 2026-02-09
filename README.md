# CP317D-Group-18-Airline-Flight-Reservation-System

Basic flight reservation web app for a school project.

## Stack
- Backend: Flask (Python)
- Frontend: React (Vite)
- Database: PostgreSQL

## Folder structure
```
backend/          Flask app, API, database access
backend/app/      Query scripts (e.g., flight_queries.py)
frontend/         React app (Vite)
docs/             Architecture notes and diagrams
scripts/          Helper scripts
```

## Quick start

Backend:
1. [Configure .env credentials](#postgresql-configuration)
2. `cd backend`
3. _Windows:_  
    `python -m venv venv`  
   _macOS/Linux:_  
    `python3 -m venv venv`
4. _Windows:_  
    `.\venv\Scripts\Activate.ps1`  
   _macOS/Linux:_  
    `source venv/bin/activate`
5. `pip install -r requirements.txt`
6. `python -m flask --app app.main run`



Frontend:
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## PostgreSQL Configuration
Set up your `.env` file with the correct password  
Click below to reveal the password for the `DB_PASSWORD` variable:

<details>
  <summary>Show DB_PASSWORD</summary>

```env
DB_PASSWORD=npg_WIoOsj86URTn
```
</details>

### Neon Dashboard
<details>
  <summary>Neon PostgreSQL serverless dashboard</summary>

https://console.neon.tech/app/projects/wandering-resonance-86050727
</details>



## Docs
- `docs/architecture.md`
