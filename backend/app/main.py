from flask import Flask
from flask_cors import CORS
from .routes import api
from .config import Config
from .db import init_db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config())
    
    CORS(app, resources={r"/api/*": {"origins": "*"}}) 

    init_db(app)
    app.register_blueprint(api, url_prefix="/api")

    @app.get("/api/health")
    def health_check():
        return {"status": "ok"}

    return app


if __name__ == "__main__":
    create_app().run(debug=True)

