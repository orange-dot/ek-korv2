"""Milestone model for project tracking."""
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from ..database import Base


class Milestone(Base):
    """Project milestone."""
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    phase = Column(Integer, nullable=False)  # Phase number
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    target_date = Column(Date, nullable=True)
    completed_date = Column(Date, nullable=True)
    status = Column(String(20), default="planned")  # planned, in_progress, completed, delayed
    deliverables = Column(Text, nullable=True)  # JSON array

    # Audit
    created_at = Column(DateTime, default=datetime.utcnow)


# Valid milestone statuses
MILESTONE_STATUSES = [
    "planned",
    "in_progress",
    "completed",
    "delayed",
    "cancelled"
]
