from app.extensions import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional

class MealPlan(db.Model):
    __tablename__ = "meal_plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    week_start_date: Mapped[str] = mapped_column(db.Date, nullable=False)
    user_id: Mapped[int] = mapped_column(db.ForeignKey("users.id"), nullable=False)

    entries = relationship("MealPlanEntry", backref="meal_plan", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "week_start_date": self.week_start_date.isoformat(),
            "entries": [e.to_dict() for e in self.entries if e.recipe is not None]
        }


class MealPlanEntry(db.Model):
    __tablename__ = "meal_plan_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    day_of_week: Mapped[str] = mapped_column(db.String(10), nullable=False)
    meal_type: Mapped[str] = mapped_column(db.String(20), nullable=False)
    meal_plan_id: Mapped[int] = mapped_column(db.ForeignKey("meal_plans.id"), nullable=False)
    recipe_id: Mapped[int] = mapped_column(db.ForeignKey("recipes.id"), nullable=False)

    recipe = relationship("Recipe")

    def to_dict(self):
        return {
            "id": self.id,
            "day_of_week": self.day_of_week,
            "meal_type": self.meal_type,
            "recipe": self.recipe.to_dict() if self.recipe else None
        }