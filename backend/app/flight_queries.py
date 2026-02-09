import os
import json
import math
from datetime import datetime
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

# Config

load_dotenv()

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "sslmode": os.getenv("DB_SSLMODE", "require")
}

BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "flightgenerator", "data")

with open(os.path.join(BASE_DIR, "airports.json"), "r", encoding="utf-8") as f:
    AIRPORTS = json.load(f)

with open(os.path.join(BASE_DIR, "countries.json"), "r", encoding="utf-8") as f:
    COUNTRIES = json.load(f)

BASE_COST_PER_KM = 0.1215
AIRLINE_NAME = "Laurier Airlines"

# Connect database

def get_connection():
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

# Utility functions
def distance_km(origin_iata, dest_iata):
    """Compute distance between two airports in km using their lat/lon."""
    origin = AIRPORTS.get(origin_iata)
    dest = AIRPORTS.get(dest_iata)
    if not origin or not dest:
        return 0
    lat1, lon1 = math.radians(origin["lat"]), math.radians(origin["lon"])
    lat2, lon2 = math.radians(dest["lat"]), math.radians(dest["lon"])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return 6371 * c

def enrich_flight(f):
    """Add readable airport, country names, airline, and compute cost."""
    origin = AIRPORTS.get(f["origin_iata"], {})
    dest = AIRPORTS.get(f["destination_iata"], {})
    dist = distance_km(f["origin_iata"], f["destination_iata"])
    return {
        **f,
        "origin_name": origin.get("name"),
        "origin_city": origin.get("city"),
        "origin_country_code": origin.get("country"),
        "origin_country": COUNTRIES.get(origin.get("country"), origin.get("country")),
        "destination_name": dest.get("name"),
        "destination_city": dest.get("city"),
        "destination_country_code": dest.get("country"),
        "destination_country": COUNTRIES.get(dest.get("country"), dest.get("country")),
        "airline": AIRLINE_NAME,
        "base_cost_cad": round(dist * BASE_COST_PER_KM, 2)
    }

# Flight queries
def get_flights_on_date(date_str):
    """Return all flights departing on a specific date."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM daily_flights
                WHERE departure_time::date = %s
                ORDER BY departure_time
            """, (date_str,))
            return [enrich_flight(f) for f in cur.fetchall()]
    finally:
        conn.close()

def get_flights_between_dates(start_date, end_date):
    """Return flights departing between two dates inclusive."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM daily_flights
                WHERE departure_time::date BETWEEN %s AND %s
                ORDER BY departure_time
            """, (start_date, end_date))
            return [enrich_flight(f) for f in cur.fetchall()]
    finally:
        conn.close()

def get_flights_from_origin(origin_iata=None, origin_city=None, origin_country=None):
    """Return flights departing from a specific airport, city, or country."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            query = "SELECT * FROM daily_flights WHERE TRUE"
            params = []

            if origin_iata:
                query += " AND origin_iata = %s"
                params.append(origin_iata)
            if origin_city:
                query += " AND origin_iata IN %s"
                codes = [code for code, info in AIRPORTS.items() if origin_city.lower() in info["city"].lower()]
                params.append(tuple(codes))
            if origin_country:
                query += " AND origin_iata IN %s"
                codes = [code for code, info in AIRPORTS.items() if info["country"] == origin_country]
                params.append(tuple(codes))

            query += " ORDER BY departure_time"
            cur.execute(query, params)
            return [enrich_flight(f) for f in cur.fetchall()]
    finally:
        conn.close()

def get_flights_to_destination(dest_iata=None, dest_city=None, dest_country=None):
    """Return flights arriving at a specific airport, city, or country."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            query = "SELECT * FROM daily_flights WHERE TRUE"
            params = []

            if dest_iata:
                query += " AND destination_iata = %s"
                params.append(dest_iata)
            if dest_city:
                query += " AND destination_iata IN %s"
                codes = [code for code, info in AIRPORTS.items() if dest_city.lower() in info["city"].lower()]
                params.append(tuple(codes))
            if dest_country:
                query += " AND destination_iata IN %s"
                codes = [code for code, info in AIRPORTS.items() if info["country"] == dest_country]
                params.append(tuple(codes))

            query += " ORDER BY departure_time"
            cur.execute(query, params)
            return [enrich_flight(f) for f in cur.fetchall()]
    finally:
        conn.close()

def get_flight_by_ticket(ticket_no):
    """Retrieve a single flight by flight_no."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM daily_flights WHERE flight_no = %s", (ticket_no,))
            row = cur.fetchone()
            return enrich_flight(row) if row else None
    finally:
        conn.close()

# example
if __name__ == "__main__":
    from pprint import pprint
    flights = get_flights_on_date("2026-03-08")
    pprint(flights[:5])  