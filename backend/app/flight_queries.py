import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "sslmode": os.getenv("DB_SSLMODE", "require")
}

def get_connection():
    """Create a new database connection."""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

def get_flights_from_origin(origin_iata, destination_iata=None, destination_country=None, departure_date=None):
    """
    Fetch flights from an origin IATA with fallbacks:
    1. origin_iata -> destination_iata
    2. origin_iata -> destination_country
    3. Earliest flight from origin on departure_date (any destination)
    
    Handles timestamps properly by checking date ranges.

    Args:
        origin_iata (str): Departure airport IATA
        destination_iata (str, optional): Arrival airport IATA
        destination_country (str, optional): Arrival country name
        departure_date (str, optional): 'YYYY-MM-DD'. If None, ignores date

    Returns:
        dict: {
            "iata": [...],
            "country_fallback": [...],
            "earliest_flight": [...]
        }
    """
    if not origin_iata:
        return {"iata": [], "country_fallback": [], "earliest_flight": []}

    origin_iata = origin_iata.upper()
    iata_results, country_results, earliest_results = [], [], []

    # Prepare date range if provided
    start_dt, end_dt = None, None
    if departure_date:
        start_dt = datetime.strptime(departure_date, "%Y-%m-%d")
        end_dt = start_dt + timedelta(days=1)

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # ----- Step 1: IATA search -----
            if destination_iata:
                if start_dt and end_dt:
                    cur.execute("""
                        SELECT *
                        FROM daily_flights
                        WHERE origin_iata = %s
                          AND destination_iata = %s
                          AND departure_time >= %s
                          AND departure_time < %s
                        ORDER BY departure_time
                    """, (origin_iata, destination_iata.upper(), start_dt, end_dt))
                else:
                    cur.execute("""
                        SELECT *
                        FROM daily_flights
                        WHERE origin_iata = %s
                          AND destination_iata = %s
                        ORDER BY departure_time
                    """, (origin_iata, destination_iata.upper()))
                iata_results = [dict(row) for row in cur.fetchall()]

            # ----- Step 2: Country fallback -----
            if not iata_results and destination_country:
                dest_country_lower = destination_country.lower()
                if start_dt and end_dt:
                    cur.execute("""
                        SELECT *
                        FROM daily_flights
                        WHERE origin_iata = %s
                          AND LOWER(destination_country) = %s
                          AND departure_time >= %s
                          AND departure_time < %s
                        ORDER BY departure_time
                    """, (origin_iata, dest_country_lower, start_dt, end_dt))
                else:
                    cur.execute("""
                        SELECT *
                        FROM daily_flights
                        WHERE origin_iata = %s
                          AND LOWER(destination_country) = %s
                        ORDER BY departure_time
                    """, (origin_iata, dest_country_lower))
                country_results = [dict(row) for row in cur.fetchall()]

            # ----- Step 3: Earliest flight fallback -----
            if not iata_results and not country_results:
                if start_dt and end_dt:
                    cur.execute("""
                        SELECT *
                        FROM daily_flights
                        WHERE origin_iata = %s
                          AND departure_time >= %s
                          AND departure_time < %s
                        ORDER BY departure_time
                        LIMIT 1
                    """, (origin_iata, start_dt, end_dt))
                else:
                    cur.execute("""
                        SELECT *
                        FROM daily_flights
                        WHERE origin_iata = %s
                        ORDER BY departure_time
                        LIMIT 1
                    """, (origin_iata,))
                earliest_results = [dict(row) for row in cur.fetchall()]

    finally:
        conn.close()

    return {
        "iata": iata_results,
        "country_fallback": country_results,
        "earliest_flight": earliest_results
    }


if __name__ == "__main__":
    from pprint import pprint

    origin_iata = "YYZ"
    destination_iata = "HND"
    destination_country = "Japan"
    departure_date = "2026-03-12" 

    results = get_flights_from_origin(origin_iata, destination_iata, destination_country, departure_date)

    print("\nFlights from YYZ → HND (IATA search):")
    pprint(results["iata"])
    print(f"Total: {len(results['iata'])}")

    print("\nFallback flights from YYZ → Japan (any airport in country):")
    pprint(results["country_fallback"])
    print(f"Total: {len(results['country_fallback'])}")

    print("\nEarliest flight from YYZ on the date (any destination):")
    pprint(results["earliest_flight"])
    print(f"Total: {len(results['earliest_flight'])}")