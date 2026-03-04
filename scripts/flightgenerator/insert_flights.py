import json
import random
import math
from datetime import datetime, timedelta, timezone as tz
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

AIRPORT_CODES = list(AIRPORTS.keys())


AIRCRAFT_NAMES = [
    "B737", "B777", "B787", "A320", "A321", "A330", "A350", "A380",
    "CRJ700", "E170", "E190", "SSJ100"
]

IATA = "AL"
AIRLINE_NAME = "Air Laurier"
BASE_COST_PER_KM = 0.1215
DAYS_AHEAD = 330

AIRPORT_INFO = {code: (
    info["lat"], info["lon"], info["name"], info["city"], info["country"]
) for code, info in AIRPORTS.items()}

def distance_km(lat1, lon1, lat2, lon2):
    r = 6371
    lat1, lat2 = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c

def round_to_5_min(dt):
    return dt.replace(minute=(dt.minute // 5) * 5, second=0, microsecond=0)

def generate_daily_flights(date_obj):
    """Generates at least one flight for every airport -> every other airport."""
    random.seed(date_obj.year * 10000 + date_obj.month * 100 + date_obj.day)
    flights = []
    assigned = set()

    for origin in AIRPORT_CODES:
        for destination in AIRPORT_CODES:
            if origin == destination:
                continue

            lat_o, lon_o, name_o, city_o, country_o = AIRPORT_INFO[origin]
            lat_d, lon_d, name_d, city_d, country_d = AIRPORT_INFO[destination]

            flight_no = f"{IATA}{random.randint(100,9999)}-{date_obj:%y%m%d}"
            while flight_no in assigned:
                flight_no = f"{IATA}{random.randint(100,9999)}-{date_obj:%y%m%d}"
            assigned.add(flight_no)

            dist_km = distance_km(lat_o, lon_o, lat_d, lon_d)
            departure = round_to_5_min(datetime(
                date_obj.year, date_obj.month, date_obj.day,
                random.randint(0, 23), random.randint(0, 59),
                tzinfo=tz.utc
            ))
            arrival = round_to_5_min(departure + timedelta(hours=dist_km / 900))

            aircraft = random.choice(AIRCRAFT_NAMES)
            base_cost = max(round(dist_km * BASE_COST_PER_KM, 2), 50.0)

            flights.append((
                flight_no,
                departure,
                arrival,
                origin,
                name_o,
                city_o,
                country_o,
                country_o, 
                destination,
                name_d,
                city_d,
                country_d,
                country_d,
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

def update_schedule():
    today = datetime.now(tz.utc).date()
    conn = get_connection()
    try:
        create_table(conn)

        with conn.cursor() as cur:
            cur.execute("""
                DELETE FROM daily_flights
                WHERE departure_time::date < %s
                   OR departure_time::date > %s
            """, (today, today + timedelta(days=DAYS_AHEAD)))
            conn.commit()

        for day_offset in range(DAYS_AHEAD):
            schedule_date = today + timedelta(days=day_offset)
            flights = generate_daily_flights(schedule_date)
            with conn.cursor() as cur:
                execute_batch(cur, """
                    INSERT INTO daily_flights (
                        flight_no, departure_time, arrival_time,
                        origin_iata, origin_name, origin_city, origin_country_code, origin_country,
                        destination_iata, destination_name, destination_city, destination_country_code, destination_country,
                        aircraft, airline, distance_km, base_cost_cad
                    )
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, flights, page_size=500)
            conn.commit()
            print(f"Inserted {len(flights)} flights for {schedule_date}")

    finally:
        conn.close()

if __name__ == "__main__":
    update_schedule()