import json
import random
import math
from datetime import datetime, timedelta, UTC
import os
import psycopg2
from psycopg2.extras import execute_batch
from dotenv import load_dotenv


load_dotenv()
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
}

BASE_DIR = os.path.join(os.path.dirname(__file__), "data")

with open(os.path.join(BASE_DIR, "airports.json"), "r", encoding="utf-8") as f:
    AIRPORTS = json.load(f)

with open(os.path.join(BASE_DIR, "countries.json"), "r", encoding="utf-8") as f:
    COUNTRIES = json.load(f)

AIRCRAFT_NAMES = [
    "B737", "B777", "B787", "A320", "A321", "A330", "A350", "A380",
    "CRJ700", "E170", "E190", "SSJ100"
]

IATA = "LA"
AIRLINE_NAME = "Laurier Airlines"
BASE_COST_PER_KM = 0.1215


def distance_km(lat1, lon1, lat2, lon2):
    earth_r = 6371
    lat1, lat2 = math.radians(lat1), math.radians(lat2)
    dlat, dlon = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return earth_r * c

def round_to_5_min(dt):
    return dt.replace(minute=(dt.minute // 5) * 5, second=0, microsecond=0)


def generate_flights(date_obj, n_flights):
    random.seed(date_obj.year * 10000 + date_obj.month * 100 + date_obj.day)
    flights = []
    airport_codes = list(AIRPORTS.keys())
    assigned_flight_nos = []

    for _ in range(n_flights):
        origin, dest = random.sample(airport_codes, 2)

        flight_no = f"{IATA}{random.randint(100, 9999)}-{date_obj:%y%m%d}"
        while flight_no in assigned_flight_nos:
            flight_no = f"{IATA}{random.randint(100, 9999)}-{date_obj:%y%m%d}"
        assigned_flight_nos.append(flight_no)

        origin_info = AIRPORTS[origin]
        dest_info = AIRPORTS[dest]

        dist_km = distance_km(
            origin_info["lat"], origin_info["lon"],
            dest_info["lat"], dest_info["lon"]
        )

        departure = round_to_5_min(datetime(
            date_obj.year, date_obj.month, date_obj.day,
            random.randint(0, 23), random.randint(0, 59),
            tzinfo=UTC
        ))

        arrival = round_to_5_min(
            departure + timedelta(hours=dist_km / 900)
        )

        aircraft = random.choice(AIRCRAFT_NAMES)
        MIN_FARE = 50.0  
        base_cost = max(round(dist_km * BASE_COST_PER_KM, 2), MIN_FARE)

        flights.append((
            flight_no,
            departure,
            arrival,

            origin,
            origin_info["name"],
            origin_info["city"],
            origin_info["country"],
            COUNTRIES.get(origin_info["country"], origin_info["country"]),

            dest,
            dest_info["name"],
            dest_info["city"],
            dest_info["country"],
            COUNTRIES.get(dest_info["country"], dest_info["country"]),

            aircraft,
            AIRLINE_NAME,

            dist_km,
            base_cost
        ))

    return flights


def get_connection():
    return psycopg2.connect(**DB_CONFIG)

def create_table(conn):
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS daily_flights (
                flight_no TEXT,
                departure_time TIMESTAMP,
                arrival_time TIMESTAMP,

                origin_iata TEXT,
                origin_name TEXT,
                origin_city TEXT,
                origin_country_code TEXT,
                origin_country TEXT,

                destination_iata TEXT,
                destination_name TEXT,
                destination_city TEXT,
                destination_country_code TEXT,
                destination_country TEXT,

                aircraft TEXT,
                airline TEXT,

                distance_km REAL,
                base_cost_cad REAL,

                PRIMARY KEY (flight_no, departure_time)
            )
        """)
    conn.commit()

def clear_old_flights(conn, start_date):
    with conn.cursor() as cur:
        cur.execute(
            "DELETE FROM daily_flights WHERE departure_time::date < %s",
            (start_date,)
        )
    conn.commit()


def update_schedule(num_days_ahead=365, num_flights_per_day=1100):
    """Maintain rolling schedule: remove past, add missing future days"""
    today = datetime.now(UTC).date()
    conn = get_connection()

    try:
        create_table(conn)
        clear_old_flights(conn, today)

        with conn.cursor() as cur:
            cur.execute("SELECT MAX(departure_time::date) FROM daily_flights")
            latest = cur.fetchone()[0]

        start_date = latest + timedelta(days=1) if latest else today
        days_to_insert = num_days_ahead - (start_date - today).days

        if days_to_insert <= 0:
            print("Schedule already up-to-date.")
            return

        for day_offset in range(days_to_insert):
            schedule_date = start_date + timedelta(days=day_offset)
            flights = generate_flights(schedule_date, num_flights_per_day)

            with conn.cursor() as cur:
                execute_batch(cur, """
                    INSERT INTO daily_flights (
                        flight_no,
                        departure_time,
                        arrival_time,

                        origin_iata,
                        origin_name,
                        origin_city,
                        origin_country_code,
                        origin_country,

                        destination_iata,
                        destination_name,
                        destination_city,
                        destination_country_code,
                        destination_country,

                        aircraft,
                        airline,

                        distance_km,
                        base_cost_cad
                    )
                    VALUES (
                        %s,%s,%s,
                        %s,%s,%s,%s,%s,
                        %s,%s,%s,%s,%s,
                        %s,%s,
                        %s,%s
                    )
                    ON CONFLICT (flight_no, departure_time) DO NOTHING
                """, flights, page_size=100)

            conn.commit()
            print(f"Inserted {num_flights_per_day} flights for {schedule_date}")

    finally:
        conn.close()

if __name__ == "__main__":
    update_schedule(num_days_ahead=365, num_flights_per_day=1100)