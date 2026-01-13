"""Expense model."""
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey, Numeric
from ..database import Base


class Expense(Base):
    """Expense record."""
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    category = Column(String(50), nullable=False)  # travel, equipment, services, other
    amount = Column(Numeric(10, 2), nullable=False)
    vat_reclaimable = Column(Numeric(10, 2), default=0)
    description = Column(Text, nullable=True)
    receipt_path = Column(String(500), nullable=True)  # File path to receipt
    status = Column(String(20), default="pending")  # pending, approved, reimbursed

    # Audit
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# Valid expense categories
EXPENSE_CATEGORIES = [
    "travel",
    "equipment",
    "services",
    "software",
    "hosting",
    "legal",
    "marketing",
    "office",
    "other"
]
