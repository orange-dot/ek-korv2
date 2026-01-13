"""Pydantic schemas for Projects module."""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


# --- IP Asset Schemas ---

class IPDeadlineBase(BaseModel):
    """Base IP deadline fields."""
    type: str
    due_date: date
    notes: Optional[str] = None


class IPDeadlineCreate(IPDeadlineBase):
    """Create IP deadline."""
    pass


class IPDeadlineResponse(IPDeadlineBase):
    """IP deadline response."""
    id: int
    completed: bool
    completed_date: Optional[date]

    class Config:
        from_attributes = True


class IPAssetBase(BaseModel):
    """Base IP asset fields."""
    type: str
    title: str = Field(..., min_length=1, max_length=500)
    filing_number: Optional[str] = None
    priority_date: Optional[date] = None
    filing_date: Optional[date] = None
    inventors: Optional[str] = None  # JSON array as string
    document_path: Optional[str] = None
    notes: Optional[str] = None


class IPAssetCreate(IPAssetBase):
    """Create IP asset."""
    deadlines: list[IPDeadlineCreate] = []


class IPAssetUpdate(BaseModel):
    """Update IP asset."""
    type: Optional[str] = None
    title: Optional[str] = None
    filing_number: Optional[str] = None
    priority_date: Optional[date] = None
    filing_date: Optional[date] = None
    status: Optional[str] = None
    inventors: Optional[str] = None
    document_path: Optional[str] = None
    notes: Optional[str] = None


class IPAssetResponse(IPAssetBase):
    """IP asset response."""
    id: int
    status: str
    created_at: datetime
    deadlines: list[IPDeadlineResponse] = []

    class Config:
        from_attributes = True


class IPAssetListResponse(BaseModel):
    """IP asset list item."""
    id: int
    type: str
    title: str
    filing_number: Optional[str]
    priority_date: Optional[date]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Milestone Schemas ---

class MilestoneBase(BaseModel):
    """Base milestone fields."""
    phase: int = Field(..., ge=0)
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    target_date: Optional[date] = None
    deliverables: Optional[str] = None  # JSON array as string


class MilestoneCreate(MilestoneBase):
    """Create milestone."""
    pass


class MilestoneUpdate(BaseModel):
    """Update milestone."""
    phase: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[date] = None
    completed_date: Optional[date] = None
    status: Optional[str] = None
    deliverables: Optional[str] = None


class MilestoneResponse(MilestoneBase):
    """Milestone response."""
    id: int
    completed_date: Optional[date]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Dashboard Schemas ---

class ProjectsDashboard(BaseModel):
    """Projects dashboard."""
    total_ip_assets: int
    pending_ip: int
    granted_ip: int
    upcoming_ip_deadlines: list[IPDeadlineResponse]
    milestones_in_progress: int
    milestones_completed: int
    recent_milestones: list[MilestoneResponse]
