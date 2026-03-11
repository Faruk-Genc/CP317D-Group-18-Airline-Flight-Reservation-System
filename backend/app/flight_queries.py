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



def get_flights_on_date(date_str):
    """
    Returns all flights departing on a specific date.

    Args:
        date_str (str): Date in 'YYYY-MM-DD' format.

    Returns:
        List[dict]: List of flight records from `daily_flights`.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM daily_flights
                WHERE departure_time::date = %s
                ORDER BY departure_time
            """, (date_str,))
            return cur.fetchall()
    finally:
        conn.close()

def get_flights_between_dates(start_date, end_date):
    """
    Returns flights departing between two dates inclusive.

    Args:
        start_date (str): Start date in 'YYYY-MM-DD' format.
        end_date (str): End date in 'YYYY-MM-DD' format.

    Returns:
        List[dict]: List of flight records from `daily_flights`.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM daily_flights
                WHERE departure_time::date BETWEEN %s AND %s
                ORDER BY departure_time
            """, (start_date, end_date))
            return cur.fetchall()
    finally:
        conn.close()

def get_all_flights_from_origin(origin):
    """
    Return all flights from the given origin (IATA, city, country, or country code).
    
    Args:
        origin (str): Exact or partial origin identifier (city, IATA, country, or country code)
        
    Returns:
        List[dict]: All matching flights
    """
    if not origin or not origin.strip():
        return []  

    origin_lower = origin.lower()
    contains_pattern = "%" + origin_lower + "%"

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT *
                FROM daily_flights
                WHERE LOWER(origin_iata) LIKE %s
                   OR LOWER(origin_city) LIKE %s
                   OR LOWER(origin_country) LIKE %s
                   OR LOWER(origin_country_code) LIKE %s
                ORDER BY departure_time
            """, (contains_pattern, contains_pattern, contains_pattern, contains_pattern))
            
            return cur.fetchall()
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

def get_flights_to_destination(dest_iata=None):
    """
    Returns flights arriving at a specific airport.

    Args:
        dest_iata (str, optional): IATA code of the destination airport. If None, returns all flights.

    Returns:
        List[dict]: List of flight records from `daily_flights`.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            if dest_iata:
                cur.execute("""
                    SELECT * FROM daily_flights
                    WHERE destination_iata = %s
                    ORDER BY departure_time
                """, (dest_iata,))
            else:
                cur.execute("SELECT * FROM daily_flights ORDER BY departure_time")
            return cur.fetchall()
    finally:
        conn.close()

def get_flight_by_ticket(ticket_no):
    """
    Retrieves a single flight by flight number.

    Args:
        ticket_no (str): Flight number.

    Returns:
        dict | None: Flight record if found, else None.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM daily_flights WHERE flight_no = %s", (ticket_no,))
            return cur.fetchone()
    finally:
        conn.close()


if __name__ == "__main__":
    from pprint import pprint
    flights = get_flights_on_date("2026-03-08")
    pprint(flights[:5])  


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