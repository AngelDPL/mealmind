from app.extensions import db
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional

class Food(db.Model):
    __tablename__ = "foods"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(db.String(120), nullable=False)
    category: Mapped[Optional[str]] = mapped_column(db.String(60))
    calories: Mapped[float] = mapped_column(default=0)  
    protein: Mapped[float] = mapped_column(default=0)   
    carbs: Mapped[float] = mapped_column(default=0)     
    fat: Mapped[float] = mapped_column(default=0)       
    unit: Mapped[str] = mapped_column(db.String(20), default='g')
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fat": self.fat,
            "unit": self.unit
        }