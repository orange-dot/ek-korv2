"""Pydantic schemas for Team module."""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


# --- Team Member Schemas ---

class TeamMemberBase(BaseModel):
    """Base team member fields."""
    name: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = None
    start_date: Optional[date] = None
    residency: str = "other"
    notes: Optional[str] = None


class TeamMemberCreate(TeamMemberBase):
    """Create team member."""
    user_id: Optional[int] = None


class TeamMemberUpdate(BaseModel):
    """Update team member."""
    name: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    start_date: Optional[date] = None
    status: Optional[str] = None
    residency: Optional[str] = None
    notes: Optional[str] = None


class TeamMemberResponse(TeamMemberBase):
    """Team member response."""
    id: int
    user_id: Optional[int]
    status: str

    class Config:
        from_attributes = True


# --- Equity Schemas ---

class EquityBase(BaseModel):
    """Base equity fields."""
    shares: int = Field(..., ge=0)
    share_class: str = "common"
    vesting_start: Optional[date] = None
    vesting_months: int = 48
    cliff_months: int = 12
    grant_date: Optional[date] = None


class EquityCreate(EquityBase):
    """Create equity grant."""
    member_id: int


class EquityUpdate(BaseModel):
    """Update equity grant."""
    shares: Optional[int] = None
    share_class: Optional[str] = None
    vesting_start: Optional[date] = None
    vesting_months: Optional[int] = None
    cliff_months: Optional[int] = None
    grant_date: Optional[date] = None


class EquityResponse(EquityBase):
    """Equity grant response."""
    id: int
    member_id: int
    vested_shares: int

    class Config:
        from_attributes = True


class EquityWithMemberResponse(EquityResponse):
    """Equity with member name."""
    member_name: str


# --- Contract Schemas ---

class ContractBase(BaseModel):
    """Base contract fields."""
    type: str
    start_date: date
    end_date: Optional[date] = None
    document_path: Optional[str] = None


class ContractCreate(ContractBase):
    """Create contract."""
    member_id: int


class ContractUpdate(BaseModel):
    """Update contract."""
    type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    document_path: Optional[str] = None


class ContractResponse(ContractBase):
    """Contract response."""
    id: int
    member_id: int
    status: str

    class Config:
        from_attributes = True


# --- Dashboard Schemas ---

class TeamDashboard(BaseModel):
    """Team dashboard."""
    total_members: int
    active_members: int
    advisors: int
    total_shares_issued: int
    total_shares_vested: int
    members: list[TeamMemberResponse]


class CapTableEntry(BaseModel):
    """Cap table entry."""
    member_id: int
    member_name: str
    role: str
    total_shares: int
    vested_shares: int
    ownership_percent: float


class CapTable(BaseModel):
    """Full cap table."""
    total_shares: int
    entries: list[CapTableEntry]
