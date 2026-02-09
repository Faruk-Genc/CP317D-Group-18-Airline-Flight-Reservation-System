# CP317D-Group-18-Airline-Flight-Reservation-System

Basic flight reservation web app for a school project.

## Stack
- Backend: Flask (Python)
- Frontend: React (Vite)
- Database: PostgreSQL

## Folder structure
```
backend/          Flask app, API, database access
frontend/         React app (Vite)
docs/             Architecture notes and diagrams
scripts/          Helper scripts
```

## Quick start

Backend:
1. `cd backend`
2. **Create virtual environment**  
   - **Windows:** `python -m venv venv`  
   - **macOS/Linux:** `python3 -m venv venv`
3. **Activate virtual environment**  
   - **Windows (PowerShell):** `.\venv\Scripts\Activate.ps1`  
   - **Windows (cmd):** `.\venv\Scripts\activate.bat`  
   - **macOS/Linux:** `source venv/bin/activate`
4. `pip install -r requirements.txt`
5. `flask --app app.main run`

Frontend:
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## PostgreSQL Configuration
Set up your `.env` file with the correct database credentials.  
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

## Flight Generation

To populate the PostgreSQL database with flight schedules:

```python
from backend.app.flightgenerator import insert_daily_schedule

# Function signature
insert_daily_schedule(date: str = "MM-DD-YY", num_flights: int)
```



## Docs
- `docs/architecture.md`
