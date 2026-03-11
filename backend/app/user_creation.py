from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

auth = Blueprint("auth", __name__)

# fake in-memory "database"
users = {}

@auth.post("/register")
def register():
    data = request.get_json()
    username = data["username"]
    password = data["password"]

    if username in users:
        return jsonify({"error": "User already exists"}), 400

    users[username] = {
        "password_hash": generate_password_hash(password)
    }

    return jsonify({"message": "User created"}), 201


@auth.post("/login")
def login():
    data = request.get_json()
    username = data["username"]
    password = data["password"]

    user = users.get(username)
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if check_password_hash(user["password_hash"], password):
        return jsonify({"message": "Login successful"}), 200

    return jsonify({"error": "Invalid credentials"}), 401