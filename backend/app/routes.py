from flask import Blueprint, request, jsonify
from .flight_queries import search_flights, get_unique_origins
from .user_creation import create_user
from passlib.hash import argon2
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os, json, secrets
from datetime import datetime
load_dotenv("backend/.env")
DB_URL = os.getenv("DATABASE_URL")
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
AIRPORTS_PATH = os.path.join(BASE_DIR, "scripts/flightgenerator/data/airports.json")
api = Blueprint("api", __name__)

@api.route("/flights", methods=["GET"])
def flights():
    origin = request.args.get("origin", "")
    results = get_unique_origins(origin)
    return jsonify(results)

@api.route("/flights/search", methods=["GET"])
def flights_search():
    origin = request.args.get("origin", "").strip().upper()
    destination = request.args.get("destination", "").strip().upper()
    departure_date = request.args.get("departure_date", "").strip()
    return_date = request.args.get("return_date", "").strip() or None
    try:
        passengers = max(1, int(request.args.get("passengers", 1)))
    except (TypeError, ValueError):
        passengers = 1
    if not origin or not destination or not departure_date:
        return jsonify({
            "error": "origin, destination, and departure_date are required"
        }), 400
    origin_is_country = len(origin) == 2
    destination_is_country = len(destination) == 2
    result = search_flights(
        origin_iata=origin,
        destination_iata=destination,
        departure_date=departure_date,
        return_date=return_date,
        passengers=passengers,
    )
    return jsonify(result)

@api.route("/signup", methods=["POST"])
def signup():
    data = request.json
    if data.get("password") != data.get("confirmPassword"):
        return jsonify({"success": False, "errors": {"password": "Passwords do not match"}}), 400
    result = create_user(data)
    status_code = 200 if result.get("success") else 400
    return jsonify(result), status_code

@api.route("/signin", methods=["POST"])
def signin():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")
    if not username or not password:
        return jsonify({"success": False, "errors": {"credentials": "Username and password are required"}}), 400
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        if not user:
            return jsonify({"success": False, "errors": {"username": "User not found"}}), 400
        if not argon2.verify(password, user["password_hash"]):
            return jsonify({"success": False, "errors": {"password": "Incorrect password"}}), 400
        user_data = {k: v for k, v in user.items() if k != "password_hash"}
        return jsonify({"success": True, "user": user_data})
    except Exception as e:
        return jsonify({"success": False, "errors": {"exception": str(e)}}), 500

def get_connection():
    return psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)

@api.route("/flights/search_recent", methods=["GET"])
def flights_search_recent():
    try:
        origin = request.args.get("origin", "").strip().upper()
        destination = request.args.get("destination", "").strip().upper()
        departure_date_str = request.args.get("departure_date", "").strip()
        try:
            passengers = max(1, int(request.args.get("passengers", 1)))
        except:
            passengers = 1
        if not origin or not destination or not departure_date_str:
            return jsonify([])
        try:
            target_date = datetime.fromisoformat(departure_date_str)
        except:
            return jsonify([])
        with open(AIRPORTS_PATH) as f:
            AIRPORTS = json.load(f)
        conn = get_connection()
        def serialize(f):
            f = dict(f)
            for k in ("departure_time", "arrival_time"):
                if f.get(k):
                    f[k] = f[k].isoformat()
            return f
        def exact():
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT * FROM daily_flights
                    WHERE origin_iata = %s
                    AND destination_iata = %s
                    ORDER BY ABS(EXTRACT(EPOCH FROM (departure_time - %s))) ASC
                    LIMIT 20
                """, (origin, destination, target_date))
                return cur.fetchall()
        def dest_country():
            if len(destination) == 3 and destination in AIRPORTS:
                return AIRPORTS[destination]["country"]
            return destination
        def origin_country():
            if len(origin) == 3 and origin in AIRPORTS:
                return AIRPORTS[origin]["country"]
            return origin
        def country_to_country(existing_ids, limit):
            with conn.cursor() as cur:
                if existing_ids:
                    cur.execute("""
                        SELECT * FROM daily_flights
                        WHERE origin_country_code = %s
                        AND destination_country_code = %s
                        AND flight_no NOT IN %s
                        ORDER BY ABS(EXTRACT(EPOCH FROM (departure_time - %s))) ASC
                        LIMIT %s
                    """, (
                        origin_country(),
                        dest_country(),
                        tuple(existing_ids),
                        target_date,
                        limit
                    ))
                else:
                    cur.execute("""
                        SELECT * FROM daily_flights
                        WHERE origin_country_code = %s
                        AND destination_country_code = %s
                        ORDER BY ABS(EXTRACT(EPOCH FROM (departure_time - %s))) ASC
                        LIMIT %s
                    """, (
                        origin_country(),
                        dest_country(),
                        target_date,
                        limit
                    ))
                return cur.fetchall()
        def global_fill(existing_ids, limit):
            with conn.cursor() as cur:
                if existing_ids:
                    cur.execute("""
                        SELECT * FROM daily_flights
                        WHERE flight_no NOT IN %s
                        ORDER BY ABS(EXTRACT(EPOCH FROM (departure_time - %s))) ASC
                        LIMIT %s
                    """, (tuple(existing_ids), target_date, limit))
                else:
                    cur.execute("""
                        SELECT * FROM daily_flights
                        ORDER BY ABS(EXTRACT(EPOCH FROM (departure_time - %s))) ASC
                        LIMIT %s
                    """, (target_date, limit))
                return cur.fetchall()
        flights = exact()
        if len(flights) < 20:
            existing = [f["flight_no"] for f in flights]
            needed = 20 - len(flights)
            more = country_to_country(existing, needed)
            flights.extend(more)
        if len(flights) < 20:
            existing = [f["flight_no"] for f in flights]
            needed = 20 - len(flights)
            more = global_fill(existing, needed)
            flights.extend(more)
        return jsonify([serialize(f) for f in flights])
    except Exception as e:
        print("Error in /flights/search_recent:", e)
        return jsonify([])
    finally:
        try:
            conn.close()
        except:
            pass

@api.route("/bookings", methods=["POST"])
def insert_booking():
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    data = request.get_json()
    required = ["departing_flight_no", "departure_time", "user_id", "passengers"]
    for field in required:
        if field not in data:
            return {"error": f"Missing {field}"}, 400
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            for _ in range(5):
                booking_id = ''.join(secrets.choice(chars) for _ in range(10))
                try:
                    cur.execute("""
                        INSERT INTO user_bookings
                            (booking_id, departing_flight_no, returning_flight_no, departure_time, user_id, passengers, cabin_type, return_time)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        booking_id,
                        data["departing_flight_no"],
                        data.get("returning_flight_no"),
                        data["departure_time"],
                        data["user_id"],
                        data["passengers"],
                        data.get("cabin_type"),
                        data.get("return_time"),
                    ))
                    cur.execute("""
                        UPDATE daily_flights
                        SET seats_left = seats_left - %s
                        WHERE flight_no = %s AND departure_time = %s
                    """, (
                        data["passengers"],
                        data["departing_flight_no"],
                        data["departure_time"]
                    ))
                    if data.get("returning_flight_no") and data.get("return_time"):
                        cur.execute("""
                            UPDATE daily_flights
                            SET seats_left = seats_left - %s
                            WHERE flight_no = %s AND departure_time = %s
                        """, (
                            data["passengers"],
                            data["returning_flight_no"],
                            data["return_time"]
                        ))
                    conn.commit()
                    return {"booking_id": booking_id}, 201
                except psycopg2.errors.UniqueViolation:
                    continue
    except Exception as e:
        return {"error": str(e)}, 500
    finally:
        conn.close()

@api.route("/bookings/<int:user_id>", methods=["GET"])
def retrieve_booking(user_id):
    conn = get_connection()
    try:
        with conn.cursor() as curr:
            curr.execute("""
                SELECT 
                    ub.booking_id,
                    df_out.origin_city AS origin_city,
                    df_out.origin_iata AS origin_iata,
                    df_out.destination_city AS destination_city,
                    df_out.destination_iata AS destination_iata,
                    df_ret.origin_city AS return_origin_city,
                    df_ret.origin_iata AS return_origin_iata,
                    df_ret.destination_city AS return_destination_city,
                    df_ret.destination_iata AS return_destination_iata,
                    ub.departure_time,
                    ub.return_time,
                    ub.passengers,
                    ub.cabin_type,
                    df_out.gate AS gate,
                    df_out.flight_no AS flight_number,
                    df_out.arrival_time AS arrival_time,
                    df_out.aircraft AS aircraft,
                    df_ret.arrival_time AS return_arrival_time,
                    df_ret.flight_no AS return_flight_number,
                    df_ret.gate AS return_gate,
                    df_ret.aircraft AS return_aircraft
                FROM user_bookings ub
                JOIN daily_flights df_out
                ON ub.departing_flight_no = df_out.flight_no
                AND ub.departure_time = df_out.departure_time
                LEFT JOIN daily_flights df_ret
                ON ub.returning_flight_no = df_ret.flight_no
                AND ub.return_time = df_ret.departure_time
                WHERE ub.user_id = %s
                """, (user_id,))
            bookings = curr.fetchall()
            return jsonify(bookings)
    except Exception as e:
        return {"error": str(e)}, 500
    finally:
        conn.close()

@api.route("/bookings/<booking_id>", methods=["DELETE"])
def cancel_booking(booking_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT departing_flight_no, returning_flight_no, departure_time, return_time, passengers
                FROM user_bookings
                WHERE booking_id = %s
            """, (booking_id,))
            booking = cur.fetchone()
            if not booking:
                return {"error": "Booking not found"}, 404
            departing_flight_no = booking["departing_flight_no"]
            returning_flight_no = booking["returning_flight_no"]
            departure_time = booking["departure_time"]
            return_time = booking["return_time"]
            passengers = booking["passengers"]
            print(booking)
            cur.execute("""
                DELETE FROM user_bookings
                WHERE booking_id = %s
            """, (booking_id,))
            cur.execute("""
                UPDATE daily_flights
                SET seats_left = seats_left + %s
                WHERE flight_no = %s AND departure_time = %s
            """, (passengers, departing_flight_no, departure_time))
            if returning_flight_no and return_time:
                cur.execute("""
                    UPDATE daily_flights
                    SET seats_left = seats_left + %s
                    WHERE flight_no = %s AND departure_time = %s
                """, (passengers, returning_flight_no, return_time))
            conn.commit()
            return {"message": "Booking cancelled"}, 200
    except Exception as e:
        return {"error": str(e)}, 500
    finally:
        conn.close()


@api.route("/checkin", methods=["GET"])
def checkin():
    conn = get_connection()
    booking_id = request.args.get("booking_id")
    flight_no = request.args.get("flight_no")
    last_name = request.args.get("last_name")
    try:
        with conn.cursor() as cur:
            select_sql = """
                SELECT
                    ub.booking_id,
                    ub.passengers,
                    ub.cabin_type,

                    u.forename,
                    u.surname,

                    -- Departing flight
                    df.flight_no          AS departing_flight_no,
                    df.departure_time     AS departure_time,
                    df.arrival_time       AS arrival_time,
                    df.origin_iata        AS origin_iata,
                    df.origin_city        AS origin_city,
                    df.destination_iata   AS destination_iata,
                    df.destination_city   AS destination_city,
                    df.aircraft           AS aircraft,
                    df.airline            AS airline,
                    df.gate               AS gate,

                    -- Returning flight (NULL if one-way)
                    rf.flight_no          AS returning_flight_no,
                    rf.departure_time     AS return_departure_time,
                    rf.arrival_time       AS return_arrival_time,
                    rf.origin_iata        AS return_origin_iata,
                    rf.origin_city        AS return_origin_city,
                    rf.destination_iata   AS return_destination_iata,
                    rf.destination_city   AS return_destination_city,
                    rf.aircraft           AS return_aircraft,
                    rf.airline            AS return_airline,
                    rf.gate               AS return_gate
                FROM user_bookings ub
                JOIN users u ON ub.user_id = u.id
                JOIN daily_flights df
                    ON ub.departing_flight_no = df.flight_no
                    AND ub.departure_time = df.departure_time
                LEFT JOIN daily_flights rf
                    ON ub.returning_flight_no = rf.flight_no
                    AND ub.return_time = rf.departure_time
            """

            if booking_id:
                cur.execute(select_sql + " WHERE ub.booking_id = %s", (booking_id,))
                row = cur.fetchone()
                if not row:
                    return jsonify({"error": "Booking not found"}), 404
                row = dict(row)
                for k, v in row.items():
                    if isinstance(v, datetime):
                        row[k] = v.isoformat()
                return jsonify(row)

            if flight_no and last_name:
                cur.execute(
                    select_sql + " WHERE df.flight_no = %s AND u.surname ILIKE %s",
                    (flight_no, last_name)
                )
                row = cur.fetchone()
                if not row:
                    return jsonify({"error": "No matching booking found"}), 404
                row = dict(row)
                for k, v in row.items():
                    if isinstance(v, datetime):
                        row[k] = v.isoformat()
                return jsonify(row)

            return jsonify({
                "error": "Provide either booking_id OR flight_no + last_name"
            }), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@api.route("/bookings/lookup/<booking_id>", methods=["GET"])
def lookup_booking(booking_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    -- Booking Info
                    ub.booking_id,
                    ub.passengers,
                    ub.cabin_type,
                    ub.departure_time,
                    ub.return_time,
                    -- User Info (no password_hash)
                    u.id AS user_id,
                    u.username,
                    u.email,
                    u.phone_number,
                    u.forename,
                    u.surname,
                    u.street,
                    u.city,
                    u.province,
                    u.postal_code,
                    u.country,
                    -- Departing Flight
                    df.flight_no         AS dep_flight_no,
                    df.departure_time    AS dep_departure_time,
                    df.arrival_time      AS dep_arrival_time,
                    df.origin_iata       AS dep_origin_iata,
                    df.origin_name       AS dep_origin_name,
                    df.origin_city       AS dep_origin_city,
                    df.origin_country    AS dep_origin_country,
                    df.destination_iata  AS dep_destination_iata,
                    df.destination_name  AS dep_destination_name,
                    df.destination_city  AS dep_destination_city,
                    df.destination_country AS dep_destination_country,
                    df.aircraft          AS dep_aircraft,
                    df.airline           AS dep_airline,
                    df.distance_km       AS dep_distance_km,
                    df.base_cost_cad     AS dep_base_cost_cad,
                    -- Returning Flight (NULL if one-way)
                    rf.flight_no         AS ret_flight_no,
                    rf.departure_time    AS ret_departure_time,
                    rf.arrival_time      AS ret_arrival_time,
                    rf.origin_iata       AS ret_origin_iata,
                    rf.origin_name       AS ret_origin_name,
                    rf.origin_city       AS ret_origin_city,
                    rf.origin_country    AS ret_origin_country,
                    rf.destination_iata  AS ret_destination_iata,
                    rf.destination_name  AS ret_destination_name,
                    rf.destination_city  AS ret_destination_city,
                    rf.destination_country AS ret_destination_country,
                    rf.aircraft          AS ret_aircraft,
                    rf.airline           AS ret_airline,
                    rf.distance_km       AS ret_distance_km,
                    rf.base_cost_cad     AS ret_base_cost_cad
                FROM user_bookings ub
                JOIN users u
                    ON ub.user_id = u.id
                JOIN daily_flights df
                    ON ub.departing_flight_no = df.flight_no
                    AND ub.departure_time = df.departure_time
                LEFT JOIN daily_flights rf
                    ON ub.returning_flight_no = rf.flight_no
                    AND ub.return_time = rf.departure_time
                WHERE ub.booking_id = %s
            """, (booking_id,))
            booking = cur.fetchone()
            if not booking:
                return jsonify({"error": "Booking not found"}), 404
            booking = dict(booking)
            for key, val in booking.items():
                if isinstance(val, datetime):
                    booking[key] = val.isoformat()
            return jsonify(booking), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@api.route("/flights/<flight_no>", methods=["GET"])
def get_flight(flight_no):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM daily_flights WHERE flight_no = %s",
                (flight_no,)
            )
            row = cur.fetchone()
            if not row:
                return jsonify({"error": "Flight not found"}), 404
            return jsonify(row)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()