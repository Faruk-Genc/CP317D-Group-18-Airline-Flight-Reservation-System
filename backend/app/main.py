import time
from datetime import datetime, timezone, timedelta

from flask import Flask, jsonify
from flask_cors import CORS

from .routes import api
from .config import Config
from .db import init_db, get_db
from .user_creation import auth


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config())

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    init_db(app)
    app.register_blueprint(api, url_prefix="/api")
    app.register_blueprint(auth)   # add this

    start_time = time.time()
    est_offset = timedelta(hours=-5)
    now_utc = datetime.now(timezone.utc)
    startup_time_est = now_utc + est_offset
    startup_timestamp_str = startup_time_est.strftime("%Y-%m-%d %H:%M:%S")

    @app.get("/")
    def health():
        elapsed_seconds = round(time.time() - start_time)
        hours, remainder = divmod(elapsed_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        uptime_str = f"{hours:02}:{minutes:02}:{seconds:02}"
        health_data = {
            "status": "ok",
            "timestamp_est": startup_timestamp_str,
            "uptime": uptime_str,
        }
        try:
            conn = get_db()
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                cur.execute("SELECT COUNT(*) FROM daily_flights")
                total_flights = cur.fetchone()[0]
            health_data["database"] = {
                "connected": True,
                "total_flights": total_flights
            }
        except Exception as e:
            health_data["status"] = "degraded"
            health_data["database"] = {
                "connected": False,
                "error": str(e)
            }
        return jsonify(health_data), 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)