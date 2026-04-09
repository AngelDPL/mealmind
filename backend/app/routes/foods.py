from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import select
from app.extensions import db
from app.models.food import Food

foods_bp = Blueprint("foods", __name__)


#-------------------------------------------------------#
#-----------------------GET_FOODS-----------------------#
#-------------------------------------------------------#

@foods_bp.route("/", methods=["GET"])
@jwt_required()
def get_foods():
    search = request.args.get("q", "")
    
    if search:
        stmt = select(Food).where(Food.name.ilike(f"%{search}%")).limit(20)
    else:
        stmt = select(Food).order_by(Food.name).limit(50)
        
    foods = db.session.execute(stmt).scalars().all()
    return jsonify([f.to_dict() for f in foods]), 200


#------------------------------------------------------------#
#-----------------------GET_CATEGORIES-----------------------#
#------------------------------------------------------------#

@foods_bp.route("/categories", methods=["GET"])
@jwt_required()
def get_categories():
    foods = db.session.execute(select(Food)).scalars().all()
    categories = sorted(set(f.category for f in foods if f.category))
    return jsonify(categories), 200