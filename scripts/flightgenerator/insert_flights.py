# insert_flights.py
from dotenv import load_dotenv
import os
import psycopg2
from psycopg2.extras import execute_batch
from flight_data import generate_base_flights
from datetime import datetime

# Load .env for DB config
load_dotenv()

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
}

# Helper to get a connection
def get_connection():
    return psycopg2.connect(**DB_CONFIG)

# Create table if it doesn't exist
def create_table(conn):
    with conn.cursor() as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS daily_flights (
                id SERIAL PRIMARY KEY,
                flight_no TEXT,
                airline TEXT,
                aircraft TEXT,
                distance_km REAL,
                base_cost_cad REAL,
                departure_time TIMESTAMP,
                arrival_time TIMESTAMP,
                origin_iata TEXT,
                origin_name TEXT,
                origin_city TEXT,
                origin_country_code TEXT,
                destination_iata TEXT,
                destination_name TEXT,
                destination_city TEXT,
                destination_country_code TEXT,
                UNIQUE(flight_no, departure_time)
            )
        """)
    conn.commit()

# Insert flights into DB, avoiding duplicates
def save_daily_schedule(schedule_date_str, num_flights):
    schedule_date = datetime.strptime(schedule_date_str, "%d-%m-%y").date()
    flights = generate_base_flights(schedule_date, num_flights)

    conn = get_connection()
    try:
        create_table(conn)

        records = []
        for f in flights:
            records.append((
                f["flight_no"],
                f["airline"],
                f["aircraft"],
                f["distance_km"],
                f["base_cost_cad"],
                f["departure_time"],
                f["arrival_time"],
                f["origin"]["iata"],
                f["origin"]["name"],
                f["origin"]["city"],
                f["origin"]["country_code"],
                f["destination"]["iata"],
                f["destination"]["name"],
                f["destination"]["city"],
                f["destination"]["country_code"]
            ))

        with conn.cursor() as cursor:
            execute_batch(cursor, """
                INSERT INTO daily_flights (
                    flight_no, airline, aircraft, distance_km, base_cost_cad,
                    departure_time, arrival_time,
                    origin_iata, origin_name, origin_city, origin_country_code,
                    destination_iata, destination_name, destination_city, destination_country_code
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (flight_no, departure_time) DO NOTHING
            """, records, page_size=100)

        conn.commit()
        print(f"Inserted {num_flights} flights for {schedule_date} into PostgreSQL (duplicates ignored)")

    finally:
        conn.close()

# Run script
if __name__ == "__main__":
    save_daily_schedule("05-02-26", 1100)