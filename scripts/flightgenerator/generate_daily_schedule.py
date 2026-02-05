from flight_data import generate_flights_for_date
from datetime import date
import json

schedule_date = date(2026, 2, 5)
flights = generate_flights_for_date(schedule_date, 1100) 

filename = f"daily_schedule_{schedule_date.isoformat()}.json"
with open(filename, "w", encoding="utf-8") as f:
    json.dump(flights, f, indent=2, ensure_ascii=False)
