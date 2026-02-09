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
    Fetch unique origins from the unique_origins table.
    Performs a search if origin string is provided (3+ chars).
    Prioritizes exact matches first.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            if origin and len(origin) >= 3:
                origin_lower = origin.lower()
                like_pattern = f"%{origin_lower}%"
                cur.execute("""
                    SELECT *
                    FROM unique_origins
                    WHERE LOWER(origin_iata) LIKE %s
                       OR LOWER(origin_city) LIKE %s
                       OR LOWER(origin_country) LIKE %s
                       OR LOWER(origin_country_code) LIKE %s
                    ORDER BY
                      CASE 
                        WHEN LOWER(origin_iata) = %s THEN 1
                        WHEN LOWER(origin_country_code) = %s THEN 2
                        WHEN LOWER(origin_city) LIKE %s THEN 3
                        WHEN LOWER(origin_country) LIKE %s THEN 4
                        ELSE 5
                      END,
                      origin_country, origin_city;
                """, (
                    like_pattern, like_pattern, like_pattern, like_pattern,
                    origin_lower, origin_lower, like_pattern, like_pattern
                ))
            else:
                cur.execute("""
                    SELECT *
                    FROM unique_origins
                    ORDER BY origin_country, origin_city;
                """)
            results = cur.fetchall()
            return [dict(zip([desc[0] for desc in cur.description], row)) for row in results]
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