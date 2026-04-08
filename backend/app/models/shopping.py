from app.extensions import db
from sqlalchemy.orm import Mapped, mapped_column

class ShoppingItem(db.Model):
    __tablename__ = "shopping_items"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(db.String(120), nullable=False)
    quantity: Mapped[float] = mapped_column(nullable=False)
    unit: Mapped[str] = mapped_column(db.String(20), nullable=False)
    checked: Mapped[bool] = mapped_column(default=False)
    meal_plan_id: Mapped[int] = mapped_column(db.ForeignKey("meal_plans.id"), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "quantity": self.quantity,
            "unit": self.unit,
            "checked": self.checked,
            "meal_plan_id": self.meal_plan_id
        }