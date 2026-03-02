import os
from datetime import datetime
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
    """
    Creates a new database connection using configured credentials.

    Returns:
        psycopg2.extensions.connection: A connection object to the database.
    """
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)


def _serialize_flight(row):
    """Convert a flight row dict so datetime/date fields are JSON-serializable."""
    if not row:
        return row
    out = dict(row)
    for key in ("departure_time", "arrival_time"):
        if key in out and out[key] is not None:
            v = out[key]
            if isinstance(v, (datetime, date)):
                out[key] = v.isoformat()
    return out


def search_flights(origin_iata, destination_iata, departure_date, return_date=None, passengers=1):
    """
    Search flights by origin, destination, and date(s).
    For one-way: only outbound flights on departure_date.
    For round-trip: outbound on departure_date, return (destination → origin) on return_date.

    Args:
        origin_iata (str): IATA code of departure airport.
        destination_iata (str): IATA code of arrival airport.
        departure_date (str): Outbound date in 'YYYY-MM-DD' format.
        return_date (str | None): Return date in 'YYYY-MM-DD' for round-trip; None for one-way.
        passengers (int): Number of passengers (accepted for API; capacity check not yet implemented).

    Returns:
        dict: {"outbound": [flight, ...], "return": [flight, ...] | None}
              Each flight is a dict from daily_flights. "return" is None for one-way.
    """
    if not origin_iata or not destination_iata or not departure_date:
        return {"outbound": [], "return": None}

    origin_iata = origin_iata.strip().upper()
    destination_iata = destination_iata.strip().upper()

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT *
                FROM daily_flights
                WHERE origin_iata = %s
                  AND destination_iata = %s
                  AND departure_time::date = %s
                ORDER BY departure_time
            """, (origin_iata, destination_iata, departure_date))
            outbound = [_serialize_flight(dict(row)) for row in cur.fetchall()]

            if return_date and return_date.strip():
                cur.execute("""
                    SELECT *
                    FROM daily_flights
                    WHERE origin_iata = %s
                      AND destination_iata = %s
                      AND departure_time::date = %s
                    ORDER BY departure_time
                """, (destination_iata, origin_iata, return_date.strip()))
                return_flights = [_serialize_flight(dict(row)) for row in cur.fetchall()]
            else:
                return_flights = None

        return {"outbound": outbound, "return": return_flights}
    finally:
        conn.close()


def get_unique_origins(origin=None):
    """
    Fetch real rows from unique_origins.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            if origin and len(origin.strip()) >= 3:
                pattern = f"%{origin.strip().lower()}%"
                cur.execute("""
                    SELECT origin_iata, origin_city, origin_country, origin_country_code
                    FROM unique_origins
                    WHERE LOWER(origin_iata) LIKE %s
                       OR LOWER(origin_city) LIKE %s
                       OR LOWER(origin_country) LIKE %s
                       OR LOWER(origin_country_code) LIKE %s
                    ORDER BY origin_country, origin_city
                """, (pattern, pattern, pattern, pattern))
            else:
                cur.execute("""
                    SELECT origin_iata, origin_city, origin_country, origin_country_code
                    FROM unique_origins
                    ORDER BY origin_country, origin_city
                """)
            return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()