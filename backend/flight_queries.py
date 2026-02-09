from dotenv import load_dotenv
import os
import psycopg2
from psycopg2.extras import RealDictCursor 

load_dotenv()

def get_connection():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        sslmode=os.getenv("DB_SSLMODE", "require")  # fallback to require
    )

def get_flights_on_date(date_str):
    """
    Retrieve all flights departing on a specific date.

    @param date_str: str - Date in "YYYY-MM-DD" format.
    @return: list of dict - Each dict contains full flight info:
        flight_no, airline, airline_iata, aircraft,
        distance_km, base_cost_cad, departure_time, arrival_time,
        origin_iata, origin_name, origin_city, origin_country_code,
        destination_iata, destination_name, destination_city, destination_country_code

    @example:
        flights = get_flights_on_date("2026-11-14")
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
    Retrieve all flights departing between two dates (inclusive).

    @param start_date: str - Start date in "YYYY-MM-DD" format.
    @param end_date: str - End date in "YYYY-MM-DD" format.
    @return: list of dict - Flights with full flight info.

    @example:
        flights = get_flights_between_dates("2026-02-05", "2026-02-06")
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


def get_flights_from_origin(origin_iata=None, origin_city=None, origin_country=None):
    """
    Retrieve flights departing from a specific airport, city, or country.

    @param origin_iata: str, optional - IATA code of the origin airport (e.g., "YYZ").
    @param origin_city: str, optional - City name (case-insensitive, partial match allowed).
    @param origin_country: str, optional - Country code (ISO Alpha-2, e.g., "CA").
    @return: list of dict - Matching flights with full flight info.

    @example:
        flights = get_flights_from_origin(origin_iata="YYZ")
        flights = get_flights_from_origin(origin_country="US")
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            query = "SELECT * FROM daily_flights WHERE TRUE"
            params = []

            if origin_iata:
                query += " AND origin_iata = %s"
                params.append(origin_iata)
            if origin_city:
                query += " AND origin_city ILIKE %s"
                params.append(f"%{origin_city}%")
            if origin_country:
                query += " AND origin_country_code = %s"
                params.append(origin_country)

            query += " ORDER BY departure_time"
            cur.execute(query, params)
            return cur.fetchall()
    finally:
        conn.close()


def get_flights_to_destination(dest_iata=None, dest_city=None, dest_country=None):
    """
    Retrieve flights arriving at a specific airport, city, or country.

    @param dest_iata: str, optional - IATA code of the destination airport.
    @param dest_city: str, optional - City name (case-insensitive, partial match allowed).
    @param dest_country: str, optional - Country code (ISO Alpha-2).
    @return: list of dict - Matching flights with full flight info.

    @example:
        flights = get_flights_to_destination(dest_iata="JFK")
        flights = get_flights_to_destination(dest_country="US")
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            query = "SELECT * FROM daily_flights WHERE TRUE"
            params = []

            if dest_iata:
                query += " AND destination_iata = %s"
                params.append(dest_iata)
            if dest_city:
                query += " AND destination_city ILIKE %s"
                params.append(f"%{dest_city}%")
            if dest_country:
                query += " AND destination_country_code = %s"
                params.append(dest_country)

            query += " ORDER BY departure_time"
            cur.execute(query, params)
            return cur.fetchall()
    finally:
        conn.close()


def get_flights_by_airline(aita):
     """
    Retrieve flights by airline name or airline IATA code.

    @param aita: str - Airline IATA code or full airline name.
    @return: list of dict - Flights matching the airline.

    @example:
        flights = get_flights_by_airline("AC")        # IATA code
        flights = get_flights_by_airline("Air Canada") # Full name
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            if len(aita) <= 3:  
                cur.execute("""
                    SELECT * FROM daily_flights
                    WHERE flight_no LIKE %s || '%%'
                    ORDER BY departure_time
                """, (aita,))
            else:  
                cur.execute("""
                    SELECT * FROM daily_flights
                    WHERE airline ILIKE %s
                    ORDER BY departure_time
                """, (f"%{aita}%",))
            return cur.fetchall()
    finally:
        conn.close()


def get_flight_by_ticket(ticket_no):
    """
    Retrieve a single flight from the database by its ticket number (flight_no).

    @param ticket_no: str - Full flight_no (e.g., "AC8292-260205").
    @return: dict or None - Full flight info if found, otherwise None.

    @example:
        flight = get_flight_by_ticket("AC8292-260205")
        print(flight['airline'], flight['origin_name'], flight['destination_name'])
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM daily_flights
                WHERE flight_no = %s
            """, (ticket_no,))
            result = cur.fetchone() 
            return result
    finally:
        conn.close()



if __name__ == "__main__":
    flights = get_flights_from_origin(origin_iata="YYZ")
    for f in flights:
        print(f"{f['flight_no']} | {f['airline']} | {f['origin_iata']} -> {f['destination_iata']}")
   
