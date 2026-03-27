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
                booking_id =  ''.join(secrets.choice(chars) for _ in range(10))
                try:
                    cur.execute("""
                            INSERT INTO user_bookings
                                                (booking_id, departing_flight_no, returning_flight_no, departure_time, user_id, passengers, cabin_type, return_time)
                                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """,(booking_id,
                            data["departing_flight_no"],
                            data.get("returning_flight_no"),
                            data["departure_time"],
                            data["user_id"],
                            data["passengers"],
                            data.get("cabin_type"),
                            data.get("return_time")))
                    
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
        import traceback
        traceback.print_exc()
        return {"error": str(e)}, 500
    finally:
        conn.close()