from flask import Blueprint, request, jsonify
from .flight_queries import get_unique_origins

api = Blueprint("api", __name__)

@api.route("/flights", methods=["GET"])
def flights():
    origin = request.args.get("origin", "")
    results = get_unique_origins(origin)
    return jsonify(results)