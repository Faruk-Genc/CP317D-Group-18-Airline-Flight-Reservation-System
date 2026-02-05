import json
import random
import math
from datetime import datetime, timedelta

with open("airports.json","r",encoding="utf-8") as f:
    airports = json.load(f)

with open("countries.json","r",encoding="utf-8") as f:
    COUNTRY_NAMES = json.load(f)

IATA="AC"

AIRCRAFT_NAMES = ["B737","B777","B777X","B787","B767","B747","B757","B717",
                  "A220","A319","A320","A321","A330","A330neo","A350","A380",
                  "An148","CRJ700","E170","E190","SSJ100","C919"]

TICKET_TYPES = {"economy":1.0,"premium_economy":1.4,"business":2.8,"first":4.2}
TICKET_WEIGHTS = {"economy":50,"premium_economy":20,"business":20,"first":10}
BASE_COST_PER_KM = 0.1215

#calaculate distance in km between origin airport and destination airport
def distance_km(lat1, lon1, lat2, lon2):
    earth_r = 6371
    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)
    dlat = math.radians(lat2-lat1)
    dlon = math.radians(lon2-lon1)
    a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
    c = 2*math.atan2(math.sqrt(a), math.sqrt(1-a))
    return earth_r*c

def round_to_5_min(dt):
    return dt.replace(minute=(dt.minute//5)*5, second=0, microsecond=0)

def compute_ticket(dist_km):
    ticket_type, = random.choices(
        list(TICKET_TYPES.keys()),
        weights=[TICKET_WEIGHTS[t] for t in TICKET_TYPES]
    )
    rate = TICKET_TYPES[ticket_type]
    cost = BASE_COST_PER_KM * dist_km * rate * random.uniform(0.88, 1.12)
    return ticket_type, round(cost, 2)

def generate_flights_for_date(date_obj, n_flights):
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
        dist_km = distance_km(origin_airport["lat"], origin_airport["lon"], dest_airport["lat"], dest_airport["lon"])
        departure = datetime(date_obj.year, date_obj.month, date_obj.day, random.randint(0, 23), random.randint(0, 59))
        departure = round_to_5_min(departure)
        arrival = round_to_5_min(departure + timedelta(hours=dist_km/900))
        ticket_type, cost_cad = compute_ticket(dist_km)
        aircraft = random.choice(AIRCRAFT_NAMES)

        flights.append({
            "flight_no": flight_no,
            "airline": "Laurier Airlines",
            "aircraft": aircraft,
            "distance_km": round(dist_km, 1),
            "ticket_type": ticket_type,
            "cost_cad": cost_cad,
            "departure_time": departure.isoformat(),
            "arrival_time": arrival.isoformat(),
            "origin": {"iata": origin_code, "name": origin_airport["name"], "city": origin_airport["city"], "country_code": origin_airport["country"]},
            "destination": {"iata": dest_code, "name": dest_airport["name"], "city": dest_airport["city"], "country_code": dest_airport["country"]}
        })
    return flights