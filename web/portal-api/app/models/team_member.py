"""Team member, equity, and contract models."""
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class TeamMember(Base):
    """Team member record."""
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Linked user account
    name = Column(String(255), nullable=False)
    role = Column(String(100), nullable=False)  # Job title/role
    email = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=True)
    status = Column(String(20), default="active")  # active, advisor, departed
    residency = Column(String(10), default="other")  # NL, other
    notes = Column(Text, nullable=True)

    # Relationships
    equity_grants = relationship("Equity", back_populates="member", cascade="all, delete-orphan")
    contracts = relationship("Contract", back_populates="member", cascade="all, delete-orphan")


class Equity(Base):
    """Equity grant (shares, vesting)."""
    __tablename__ = "equity"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("team_members.id", ondelete="CASCADE"), nullable=False)
    shares = Column(Integer, nullable=False)
    share_class = Column(String(50), default="common")  # common, preferred
    vesting_start = Column(Date, nullable=True)
    vesting_months = Column(Integer, default=48)  # Standard 4-year vesting
    cliff_months = Column(Integer, default=12)  # Standard 1-year cliff
    grant_date = Column(Date, nullable=True)

    # Relationships
    member = relationship("TeamMember", back_populates="equity_grants")

    @property
    def vested_shares(self) -> int:
        """Calculate currently vested shares."""
        if not self.vesting_start:
            return self.shares  # Fully vested if no vesting schedule

        today = date.today()
        months_elapsed = (today.year - self.vesting_start.year) * 12 + (today.month - self.vesting_start.month)

        if months_elapsed < self.cliff_months:
            return 0  # Still in cliff period

        if months_elapsed >= self.vesting_months:
            return self.shares  # Fully vested

        # Pro-rata vesting after cliff
        return int(self.shares * months_elapsed / self.vesting_months)


class Contract(Base):
    """Employment/freelance contract."""
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("team_members.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)  # employment, freelance, advisory, founder
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(String(20), default="draft")  # draft, active, terminated
    document_path = Column(String(500), nullable=True)

    # Relationships
    member = relationship("TeamMember", back_populates="contracts")


# Valid member statuses
MEMBER_STATUSES = [
    "active",
    "advisor",
    "departed"
]

# Valid contract types
CONTRACT_TYPES = [
    "employment",
    "freelance",
    "advisory",
    "founder"
]
