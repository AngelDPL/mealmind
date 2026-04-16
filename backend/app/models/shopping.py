from app.extensions import db
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Float, ForeignKey

class ShoppingItem(db.Model):
    __tablename__ = "shopping_items"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    quantity: Mapped[float] = mapped_column()
    unit: Mapped[str] = mapped_column(String(20))
    checked: Mapped[bool] = mapped_column(default=False)
    meal_plan_id: Mapped[int] = mapped_column(ForeignKey("meal_plans.id", ondelete="CASCADE"))
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "quantity": self.quantity,
            "unit": self.unit,
            "checked": self.checked,
            "meal_plan_id": self.meal_plan_id
        }