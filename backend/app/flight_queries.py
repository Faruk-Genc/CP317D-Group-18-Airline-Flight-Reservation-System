import os
from datetime import datetime, date
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "sslmode": os.getenv("DB_SSLMODE", "require")
}

def get_connection():
    """
    Creates a new database connection using configured credentials.

    Returns:
        psycopg2.extensions.connection: A connection object to the database.
    """
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
