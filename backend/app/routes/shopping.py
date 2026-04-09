from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select
from app.extensions import db
from app.models.shopping import ShoppingItem
from app.models.meal_plan import MealPlan


shopping_bp = Blueprint("shopping", __name__)


#--------------------------------------------------------------------#
#-----------------------GENERATE_SHOPPING_LIST-----------------------#
#--------------------------------------------------------------------#

@shopping_bp.route("/generate/<int:plan_id>", methods=["POST"])
@jwt_required()
def generate_shopping_list(plan_id):
    user_id = get_jwt_identity()
    plan = db.session.execute(
        select(MealPlan).where(MealPlan.id == plan_id, MealPlan.user_id == user_id)
    ).scalars_one_or_none()
    
    if not plan:
        jsonify({"error": "Plan not found"}), 404
        
    existing = db.session.execute(
        select(ShoppingItem).where(ShoppingItem.meal_plan_id == plan_id)
    ).scalars().all()
    for item in existing:
        db.session.delete(item)
    db.session.flush()
    
    items = {}
    for entry in plan.entries:
        if not entry.recipe:
            continue
        for ing in entry.recpe.ingredients:
            key = (ing.food.name, ing.food.unit)
            if key in items:
                items[key] += ing.quantity
            else:
                items[key] = ing.quantity
                
    for (name, unit), quantity in items.items():
        item = ShoppingItem(
            name=name,
            quantity=round(quantity, 1),
            unit=unit,
            meal_plan_id=plan_id
        )
        db.session.add(item)
        
    db.session.commit()
    
    result = db.session.execute(
        select(ShoppingItem).where(ShoppingItem.meal_plan_id == plan_id)
    ).scalars().all()
    return jsonify([i.to_dict() for i in result]), 201