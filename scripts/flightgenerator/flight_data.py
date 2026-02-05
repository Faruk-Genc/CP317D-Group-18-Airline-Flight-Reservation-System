import json
import random
import math
from datetime import datetime, timedelta

# Airport data based on "airportsdata" by mborsetti:
# https://github.com/mborsetti/airportsdata
# Filtered into custom JSON for this project.
with open("airports.json", "r", encoding="utf-8") as f:
    airports = json.load(f)

with open("countries.json", "r", encoding="utf-8") as f:
    COUNTRY_NAMES = json.load(f)

IATA = "AC"

AIRCRAFT_NAMES = [
    "B737","B777","B777X","B787","B767","B747","B757","B717",
    "A220","A319","A320","A321","A330","A330neo","A350","A380",
    "An148","CRJ700","E170","E190","SSJ100","C919"
]

BASE_COST_PER_KM = 0.1215

# Calculate distance in km between origin airport and destination airport
def distance_km(lat1, lon1, lat2, lon2):
    earth_r = 6371
    lat1, lat2 = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return earth_r * c

def round_to_5_min(dt):
    return dt.replace(minute=(dt.minute//5)*5, second=0, microsecond=0)

def compute_base_cost(dist_km):
    # Base price for the flight, can later multiply for ticket classes
    return round(BASE_COST_PER_KM * dist_km * random.uniform(0.88, 1.12), 2)

def generate_base_flights(date_obj, n_flights):
    """
    Generate flights for a given date with base price only (no ticket types).
    """
    random.seed(date_obj.year*10000 + date_obj.month*100 + date_obj.day)
    flights = []
    airport_codes = list(airports.keys())
    assigned_flight_nos = []

    for _ in range(n_flights):
        origin_code = random.choice(airport_codes)
        dest_code = random.choice(airport_codes)
        while dest_code == origin_code:
            dest_code = random.choice(airport_codes)

        flight_no = IATA + str(random.randint(100, 9999))
        while flight_no in assigned_flight_nos:
            flight_no = IATA + str(random.randint(100, 9999))
        assigned_flight_nos.append(flight_no)

        origin_airport = airports[origin_code]
        dest_airport = airports[dest_code]
        dist_km = distance_km(
            origin_airport["lat"], origin_airport["lon"],
            dest_airport["lat"], dest_airport["lon"]
        )

        departure = datetime(date_obj.year, date_obj.month, date_obj.day,
                             random.randint(0, 23), random.randint(0, 59))
        departure = round_to_5_min(departure)
        arrival = round_to_5_min(departure + timedelta(hours=dist_km / 900))

        aircraft = random.choice(AIRCRAFT_NAMES)
        base_cost = compute_base_cost(dist_km)

        
        flights.append({
            "flight_no": flight_no,
            "airline": "Laurier Airlines",
            "aircraft": aircraft,
            "distance_km": round(dist_km, 1),
            # Base price for the flight.
            # Can multiply by a ticket class multiplier for different classes in frontend, i.e.
            #   - economy: 1.0
            #   - premium economy: 1.4
            #   - business: 2.8
            #   - first: 4.2
            "base_cost_cad": base_cost, 
            "departure_time": departure.isoformat(),
            "arrival_time": arrival.isoformat(),
            "origin": {
                "iata": origin_code,
                "name": origin_airport["name"],
                "city": origin_airport["city"],
                "country_code": origin_airport["country"]
            },
            "destination": {
                "iata": dest_code,
                "name": dest_airport["name"],
                "city": dest_airport["city"],
                "country_code": dest_airport["country"]
            }
        })

    return flights
