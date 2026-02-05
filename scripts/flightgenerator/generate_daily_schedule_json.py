from flight_data import generate_base_flights
import json
from datetime import datetime
import os

def save_daily_schedule(schedule_date_str, num_flights):
    schedule_date = datetime.strptime(schedule_date_str, "%d-%m-%y").date()
    flights = generate_base_flights(schedule_date, num_flights)

    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    output_dir = os.path.join(project_root, "backend", "data")
    os.makedirs(output_dir, exist_ok=True)

    filename = os.path.join(output_dir, f"daily_schedule_{schedule_date.isoformat()}.json")
    
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(flights, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {num_flights} flights for {schedule_date} to {filename}")


save_daily_schedule("05-02-26", 1100)