from flask import Blueprint, request, jsonify
from .flight_queries import search_flights, get_unique_origins

api = Blueprint("api", __name__)

@api.route("/flights", methods=["GET"])
def flights():
    origin = request.args.get("origin", "")
    results = get_unique_origins(origin)
    return jsonify(results)


@api.route("/flights/search", methods=["GET"])
def flights_search():
    """
    Search flights by origin, destination, and date(s).
    Query params:
      - origin (IATA)
      - destination (IATA)
      - departure_date (YYYY-MM-DD)
      - return_date (optional, YYYY-MM-DD)
      - passengers (optional, default 1)
    One-way: omit return_date. Round-trip: include return_date.
    """
    origin = request.args.get("origin", "").strip()
    destination = request.args.get("destination", "").strip()
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

    result = search_flights(
        origin_iata=origin,
        destination_iata=destination,
        departure_date=departure_date,
        return_date=return_date,
        passengers=passengers,
    )
    return jsonify(result)