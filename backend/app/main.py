from flask import Flask
from flask_cors import CORS

from .config import Config
from .db import init_db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config())
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    init_db(app)

    @app.get("/api/health")
    def health_check():
        return {"status": "ok"}

    return app


if __name__ == "__main__":
    create_app().run()

