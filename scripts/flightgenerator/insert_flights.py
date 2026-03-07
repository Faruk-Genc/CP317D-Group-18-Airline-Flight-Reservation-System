import json
import random
import math
from datetime import datetime, timedelta, timezone as tz
import os
import psycopg2
from psycopg2.extras import execute_batch
from dotenv import load_dotenv
from io import StringIO

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

LONG_HAUL_AIRCRAFT = [
    "B777",
    "B787",
    "A330",
    "A350",
    "A380",
    "B747"
]

SHORT_HAUL_AIRCRAFT = [
    "A220",
    "A320",
    "A321",
    "B737",
    "CRJ700",
    "CRJ900",
    "E170",
    "E175",
    "E190"
]

AIRCRAFT_SEATS = {
    "A220": 130,
    "A320": 180,
    "A321": 220,
    "B737": 178,
    "B777": 396,
    "B787": 290,
    "A330": 270,
    "A350": 325,
    "A380": 525,
    "B747": 416,
    "CRJ700": 70,
    "CRJ900": 90,
    "E170": 76,
    "E175": 88,
    "E190": 100
}

IATA = "AL"
AIRLINE_NAME = "Air Laurier"
BASE_COST_PER_KM = 0.1215
DAYS_AHEAD = 365
FLIGHTS_PER_DAY = 6500

AIRPORT_INFO = {code: (
    info["lat"], info["lon"], info["name"], info["city"], info["country"]
) for code, info in AIRPORTS.items()}

HUBS = [
    # North America
    "ATL",  # Atlanta
    "DFW",  # Dallas
    "ORD",  # Chicago
    "LAX",  # Los Angeles
    "JFK",  # New York
    "SEA",  # Seattle
    "YYZ",  # Toronto
    "YVR",  # Vancouver

    # Europe
    "LHR",  # London Heathrow
    "CDG",  # Paris Charles de Gaulle
    "FRA",  # Frankfurt
    "AMS",  # Amsterdam
    "MAD",  # Madrid
    "MUC",  # Munich
    "IST",  # Istanbul

    # Middle East
    "DXB",  # Dubai
    "DOH",  # Doha
    "AUH",  # Abu Dhabi

    # Asia
    "HND",  # Tokyo Haneda
    "NRT",  # Tokyo Narita
    "ICN",  # Seoul Incheon
    "PEK",  # Beijing
    "PVG",  # Shanghai
    "HKG",  # Hong Kong
    "SIN",  # Singapore
    "BKK",  # Bangkok
    "DEL",  # Delhi

    # Oceania
    "SYD",  # Sydney
    "MEL",  # Melbourne

    # Latin America
    "GRU",  # Sao Paulo
    "MEX",  # Mexico City
    "BOG"   # Bogotá
]
SPOKES = [a for a in AIRPORT_CODES if a not in HUBS]
SPOKE_DISTANCE = 8000
MAX_DISTANCE = 13000

def distance_km(lat1, lon1, lat2, lon2):
    r = 6371
    lat1, lat2 = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c

HUB_DISTANCES = {}
for o in HUBS:
    for d in HUBS:
        if o != d:
            lat_o, lon_o, name_o, city_o, country_o = AIRPORT_INFO[o]
            lat_d, lon_d, name_d, city_d, country_d = AIRPORT_INFO[d]
            dist = distance_km(lat_o, lon_o, lat_d, lon_d)
            HUB_DISTANCES[(o,d)] = dist

def round_to_5_min(dt):
    return dt.replace(minute=(dt.minute // 5) * 5, second=0, microsecond=0)

def generate_daily_flights(date_obj, n_flights):
    random.seed(date_obj.year * 10000 + date_obj.month * 100 + date_obj.day)
    flights = []
    trafficHours = {0:1, 1:1, 2:1, 3:1, 4:1,          
    5:2,
    6:6, 7:8, 8:9, 9:7,               
    10:4,
    11:6, 12:5,                       
    13:6, 14:5,
    15:7,
    16:8, 17:9, 18:9, 19:7,          
    20:6,
    21:4,
    22:3,
    23:2}
    hours = list(trafficHours.keys())
    weights = list(trafficHours.values())
    flight_counter = 1000

    def random_departure():
       

        hour = random.choices(hours, weights = weights)[0]
        minute = random.randint(0,59)

        dt = datetime(
            date_obj.year,
            date_obj.month,
            date_obj.day,
            hour,
            minute,tzinfo=tz.utc
        )
        return round_to_5_min(dt)
        
    #generate flights from each hub
    for origin in HUBS:
        for destination in HUBS:
            if origin == destination:
                continue
            lat_o, lon_o, name_o, city_o, country_o = AIRPORT_INFO[origin]
            lat_d, lon_d, name_d, city_d, country_d = AIRPORT_INFO[destination]
            dist_km = HUB_DISTANCES[(origin,destination)]
            if dist_km > MAX_DISTANCE:
                continue


            for _ in range(random.randint(2,5)): # generate more flighs between hubs
                flight_no = f"{IATA}{flight_counter+1000}-{date_obj:%y%m%d}"
                flight_counter += 1

                departure = random_departure()
                arrival = round_to_5_min(departure + timedelta(hours=dist_km / 900))

                if dist_km > 5000:
                    aircraft = random.choice(LONG_HAUL_AIRCRAFT)
                else:
                    aircraft = random.choice(SHORT_HAUL_AIRCRAFT)
                variance = random.uniform(0.85, 1.25)
                base_cost = max(round(dist_km * BASE_COST_PER_KM * variance, 2), 50.0)
                seatsLeft = AIRCRAFT_SEATS[aircraft]

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
                    base_cost,
                    seatsLeft
                ))

    remaining = n_flights - len(flights)

    while remaining > 0:

        if random.random()< 0.7:
            origin = random.choice(HUBS)
            destination = random.choice(SPOKES)
        else:
            origin = random.choice(SPOKES)
            destination = random.choice(HUBS)

        lat_o, lon_o, name_o, city_o, country_o = AIRPORT_INFO[origin]
        lat_d, lon_d, name_d, city_d, country_d = AIRPORT_INFO[destination]


        dist_km = distance_km(lat_o, lon_o, lat_d, lon_d)
        if dist_km > SPOKE_DISTANCE:
            continue

        flight_no = f"{IATA}{flight_counter+1000}-{date_obj:%y%m%d}"
        flight_counter += 1

        departure = random_departure()
        arrival = round_to_5_min(departure + timedelta(hours=dist_km / 900))

        if dist_km > 5000:
                    aircraft = random.choice(LONG_HAUL_AIRCRAFT)
        else:
            aircraft = random.choice(SHORT_HAUL_AIRCRAFT)
        base_cost = max(round(dist_km * BASE_COST_PER_KM, 2), 50.0)
        seatsLeft = AIRCRAFT_SEATS[aircraft]

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
            base_cost,
            seatsLeft
        ))
        remaining -= 1

    random.shuffle(flights)
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
                seats_left INTEGER,
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

        with conn.cursor() as cur:
            cur.execute("""
                SELECT DISTINCT departure_time::date FROM daily_flights
                WHERE departure_time::date >= %s
                  AND departure_time::date <= %s
            """, (today, today + timedelta(days=DAYS_AHEAD)))
            existing_dates = {row[0] for row in cur.fetchall()}

        all_flights = []
        for day_offset in range(DAYS_AHEAD):
            schedule_date = today + timedelta(days=day_offset)
            if schedule_date in existing_dates:
                continue
            flights = generate_daily_flights(schedule_date, FLIGHTS_PER_DAY)
            print(f"generated {len(flights)} flights for {schedule_date}")
            all_flights.extend(flights)

        if all_flights:
            print("Inserting...")
            with conn.cursor() as cur:
                csv_buffer = StringIO()
                for flight in all_flights:
                    row = "\t".join(str(v) for v in flight)
                    csv_buffer.write(row + "\n")
                csv_buffer.seek(0)
                
                cur.copy_from(
                    csv_buffer,
                    'daily_flights',
                    columns=(
                        'flight_no', 'departure_time', 'arrival_time',
                        'origin_iata', 'origin_name', 'origin_city', 
                        'origin_country_code', 'origin_country',
                        'destination_iata', 'destination_name', 'destination_city',
                        'destination_country_code', 'destination_country',
                        'aircraft', 'airline', 'distance_km', 
                        'base_cost_cad', 'seats_left'
                    )
                )
            print("Finished")
            conn.commit()
    finally:
        conn.close()

if __name__ == "__main__":
    update_schedule()
    # for day_offset in range(DAYS_AHEAD):
    #         today = datetime.now(tz.utc).date()

    #         schedule_date = today + timedelta(days=day_offset)
    #         flights = generate_daily_flights(schedule_date, FLIGHTS_PER_DAY)
    #         print(f"Inserted {len(flights)} flights for {schedule_date}")
