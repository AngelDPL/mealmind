from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import select
from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__)


def validate_fields(data, fields):
    return data and all(k in data and data[k] for k in fields)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    
    if not validate_fields(data, ["email", "username", "password"]):
        return jsonify({"error": "Missing required fields"}), 400
    
    if db.session.execute(
        select(User).where(User.email == data["email"])
    ).scalars_one_or_none():
        return jsonify({"error": "Email already registered"}), 409
    
    if db.session.execute(
        select(User).where(User.username == data["username"])
    ).scalars_one_or_none():
        return jsonify({"error": "Username already taken"}), 409
    
    user = User(
        username = data["username"],
        email = data["email"]
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"Message": "User created successfully", "user": user.to_dict}), 201