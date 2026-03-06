import os
import psycopg2
import bcrypt
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    raise ValueError("DATABASE_URL not found.")

def create_user(user_data: dict) -> dict:
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    result = {"success": False, "user_id": None, "errors": {}}

    try:
        cur.execute("""
            SELECT 
                username = %s AS username_conflict,
                email = %s AS email_conflict,
                phone_number = %s AS phone_conflict
            FROM users
            WHERE username = %s OR email = %s OR (phone_number IS NOT NULL AND phone_number = %s)
            LIMIT 1;
        """, (
            user_data["username"],
            user_data["email"],
            user_data.get("phone_number"),
            user_data["username"],
            user_data["email"],
            user_data.get("phone_number")
        ))
        row = cur.fetchone()
        if row:
            if row[0]:
                result["errors"]["username"] = "already exists"
            if row[1]:
                result["errors"]["email"] = "already exists"
            if row[2]:
                result["errors"]["phone_number"] = "already exists"
            return result  

        hashed_password = bcrypt.hashpw(
            user_data["password"].encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

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
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id;
        """, (
            user_data["username"],
            user_data["email"],
            hashed_password,
            user_data.get("phone_number"),
            user_data["forename"],
            user_data["surname"],
            user_data["street"],
            user_data["city"],
            user_data.get("province"),
            user_data["postal_code"],
            user_data["country"]
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
        "username": "john_doe",
        "email": "john_doe@email.com",
        "password": "password",
        "phone_number": "1234567890",
        "forename": "John",
        "surname": "Doe",
        "street": "123 Street St",
        "city": "Toronto",
        "province": "ON",
        "postal_code": "ABC123",
        "country": "Canada"
    }

    result = create_user(test_user)
    if result["success"]:
        print(f"Created user with ID: {result['user_id']}")
    else:
        print("Failed to create user. Conflicts/errors:", result["errors"])

    # reset_users_table()