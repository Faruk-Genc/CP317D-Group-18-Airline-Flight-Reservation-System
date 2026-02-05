import sqlite3
from flight_data import generate_base_flights
from datetime import datetime
import os

def save_daily_schedule_sql(schedule_date_str, num_flights):
    schedule_date = datetime.strptime(schedule_date_str, "%d-%m-%y").date()
    flights = generate_base_flights(schedule_date, num_flights)

    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    db_dir = os.path.join(project_root, "backend", "data")
    os.makedirs(db_dir, exist_ok=True)
    db_path = os.path.join(db_dir, "flights.db")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS daily_flights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            flight_no TEXT,
            airline TEXT,
            aircraft TEXT,
            distance_km REAL,
            base_cost_cad REAL,
            departure_time TEXT,
            arrival_time TEXT,
            origin_iata TEXT,
            origin_name TEXT,
            origin_city TEXT,
            origin_country_code TEXT,
            destination_iata TEXT,
            destination_name TEXT,
            destination_city TEXT,
            destination_country_code TEXT
        )
    """)

    for f in flights:
        cursor.execute("""
            INSERT INTO daily_flights (
                flight_no, airline, aircraft, distance_km, base_cost_cad,
                departure_time, arrival_time,
                origin_iata, origin_name, origin_city, origin_country_code,
                destination_iata, destination_name, destination_city, destination_country_code
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            f["flight_no"], f["airline"], f["aircraft"], f["distance_km"], f["base_cost_cad"],
            f["departure_time"], f["arrival_time"],
            f["origin"]["iata"], f["origin"]["name"], f["origin"]["city"], f["origin"]["country_code"],
            f["destination"]["iata"], f["destination"]["name"], f["destination"]["city"], f["destination"]["country_code"]
        ))

    conn.commit()
    conn.close()
    print(f"Inserted {num_flights} flights for {schedule_date} into {db_path}")


save_daily_schedule_sql("05-02-26", 1100)