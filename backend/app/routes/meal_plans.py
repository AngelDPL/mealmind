from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select
from app.extensions import db
from app.models.meal_plan import MealPlan, MealPlanEntry
from datetime import date

meal_plan_bp = Blueprint("meal_plan", __name__)


@meal_plan_bp.route("/", methods=["GET"])
@jwt_required()
def get_meal_plans():
    user_id = get_jwt_identity()
    plans = db.session.execute(
        select(MealPlan).where(MealPlan.user_id == user_id)
    ).scalars().all()
    return jsonify([p.to_dict() for p in plans]), 200


@meal_plan_bp.route("/", methods=["POST"])
@jwt_required()
def create_meal_plan():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or "week_start_date" not in data:
        return jsonify({"error": "Weeks start date is required"}), 400
    
    week_start = date.fromisoformat(data["week_start_date"])
    
    plan = MealPlan(
        week_start_date=week_start,
        user_id=user_id
        )
    db.session.add(plan)
    db.session.flush()
    
    for entry in data.get("entries", []):
        meal_entry = MealPlanEntry(
            day_of_week=entry["day_of_week"],
            meal_type=entry["meal_type"],
            recipe_id=entry["recipe_id"],
            meal_plan_id=plan.id
        )
        db.session.add(meal_entry)
        
    db.session.commit()
    return jsonify(plan.to_dict()), 201


@meal_plan_bp.route("/<int:plan_id>/complete", methods=["PATCH"])
@jwt_required()
def complete_meal_plan(plan_id):
    user_id = get_jwt_identity()
    plan = db.session.execute(
        select(MealPlan).where(MealPlan.id == plan_id, MealPlan.user_id == user_id)
    ).scalar_one_or_none()

    if not plan:
        return jsonify({"error": "Plan not found"}), 404

    plan.completed = not plan.completed
    db.session.commit()
    return jsonify(plan.to_dict()), 200


@meal_plan_bp.route("/<int:plan_id>", methods=["DELETE"])
@jwt_required()
def delete_meal_plan(plan_id):
    user_id = get_jwt_identity()
    plan = db.session.execute(
        select(MealPlan).where(MealPlan.id == plan_id, MealPlan.user_id == user_id)
    ).scalar_one_or_none()
    
    if not plan:
        return jsonify({"message": "Plan not found"}), 404
    
    db.session.delete(plan)
    db.session.commit()
    return jsonify({"message": "Plan deleted successfully"}), 200