"""IP Asset and IP Deadline models."""
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from ..database import Base


class IPAsset(Base):
    """Intellectual Property asset (patents, disclosures)."""
    __tablename__ = "ip_assets"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)  # invention_disclosure, provisional, pct, national
    title = Column(String(500), nullable=False)
    filing_number = Column(String(100), nullable=True)
    priority_date = Column(Date, nullable=True)
    filing_date = Column(Date, nullable=True)
    status = Column(String(20), default="draft")  # draft, filed, pending, granted, abandoned
    inventors = Column(Text, nullable=True)  # JSON array
    document_path = Column(String(500), nullable=True)  # Path to patent/ folder
    notes = Column(Text, nullable=True)

    # Audit
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    deadlines = relationship("IPDeadline", back_populates="ip_asset", cascade="all, delete-orphan")


class IPDeadline(Base):
    """IP-related deadline (PCT filing, national phase, etc.)."""
    __tablename__ = "ip_deadlines"

    id = Column(Integer, primary_key=True, index=True)
    ip_asset_id = Column(Integer, ForeignKey("ip_assets.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)  # pct_filing, national_phase, response, renewal
    due_date = Column(Date, nullable=False)
    completed = Column(Boolean, default=False)
    completed_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    ip_asset = relationship("IPAsset", back_populates="deadlines")


# Valid IP asset types
IP_ASSET_TYPES = [
    "invention_disclosure",
    "provisional",
    "pct",
    "national",
    "utility_model",
    "design_patent",
    "trademark"
]

# Valid IP statuses
IP_STATUSES = [
    "draft",
    "filed",
    "pending",
    "granted",
    "abandoned",
    "expired"
]
