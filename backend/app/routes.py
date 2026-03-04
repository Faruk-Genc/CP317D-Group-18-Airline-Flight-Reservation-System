from flask import Blueprint, jsonify
from .db import get_db

api = Blueprint("api", __name__)

@api.route("/flights", methods=["GET"])
def flights():
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM daily_flights")
        rows = cur.fetchall()
        return jsonify(rows)