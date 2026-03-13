import os
import psycopg2
from passlib.hash import argon2
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    raise ValueError("DATABASE_URL not found.")


def create_user(user_data: dict) -> dict:
    """
    Create a new user in the database.

    Expected keys in user_data:
    - username, email, password, phone_number, forename, surname,
      street, city, province, postal_code, country
    """
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    result = {"success": False, "user_id": None, "errors": {}}

    try:
        cur.execute("""
            SELECT username, email, phone_number
            FROM users
            WHERE username = %s OR email = %s OR (phone_number IS NOT NULL AND phone_number = %s)
        """, (user_data["username"], user_data["email"], user_data.get("phone_number")))

        rows = cur.fetchall()
        errors = {}

        for row in rows:
            if row[0] == user_data["username"]:
                errors["username"] = "Username already exists"
            if row[1] == user_data["email"]:
                errors["email"] = "Email address already in use"
            if row[2] == user_data.get("phone_number"):
                errors["phone_number"] = "Phone number already in use"

        if errors:
            return {"success": False, "errors": errors}

        hashed_password = argon2.hash(user_data["password"])

        cur.execute("""
            INSERT INTO users (
                username,
                email,
                password_hash,
                phone_number,
                forename,
                surname,
                street,
                city,
                province,
                postal_code,
                country
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id;
        """, (
            user_data["username"],
            user_data["email"],
            hashed_password,
            user_data.get("phone_number"),
            user_data["forename"],
            user_data["surname"],
            user_data.get("street"),
            user_data.get("city"),
            user_data.get("province"),
            user_data.get("postal_code"),
            user_data.get("country")
        ))

        user_id = cur.fetchone()[0]
        conn.commit()
        result["success"] = True
        result["user_id"] = user_id
        return result

    except Exception as e:
        conn.rollback()
        result["errors"]["exception"] = str(e)
        return result

    finally:
        cur.close()
        conn.close()


def reset_users_table() -> None:
    """
    Truncate the users table and reset auto-increment ID.
    """
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    try:
        cur.execute("TRUNCATE TABLE users RESTART IDENTITY CASCADE;")
        conn.commit()
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    test_user = {
        "username": "asd",
        "email": "asd@email.com",
        "password": "asd",
        "phone_number": "asd",
        "forename": "asd",
        "surname": "asd",
        "street": "asd",
        "city": "asd",
        "province": "asd",
        "postal_code": "ABC123",
        "country": "Canada"
    }

    result = create_user(test_user)
    if result["success"]:
        print(f"Created user with ID: {result['user_id']}")
    else:
        print("Failed to create user:", result["errors"])