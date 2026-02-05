# Backend (Flask)

## Quick start
1. Create and activate a virtual environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Run the server:
   - `flask --app app.main run`

## Environment
Set these in a `.env` file or your shell:
- `DATABASE_URL=postgresql://user:password@localhost:5432/flight_reservation`
- `CORS_ORIGINS=http://localhost:5173`

## Notes
- API endpoints are prefixed with `/api`.
- Health check: `GET /api/health`

