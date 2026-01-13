"""Projects endpoints - IP assets, milestones."""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..iam.models import User
from ..iam.dependencies import get_current_user, require_permission, get_client_info
from ..iam.service import IAMService
from ..models.ip_asset import IPAsset, IPDeadline, IP_ASSET_TYPES, IP_STATUSES
from ..models.milestone import Milestone, MILESTONE_STATUSES
from ..schemas.projects import (
    IPAssetCreate, IPAssetUpdate, IPAssetResponse, IPAssetListResponse,
    IPDeadlineCreate, IPDeadlineResponse,
    MilestoneCreate, MilestoneUpdate, MilestoneResponse,
    ProjectsDashboard
)

router = APIRouter(prefix="/projects", tags=["Projects"])


# --- Dashboard ---

@router.get("/dashboard", response_model=ProjectsDashboard)
async def get_projects_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("projects.view"))
):
    """Get projects dashboard."""
    # IP stats
    ip_assets = db.query(IPAsset).all()
    total_ip = len(ip_assets)
    pending_ip = len([a for a in ip_assets if a.status == "pending"])
    granted_ip = len([a for a in ip_assets if a.status == "granted"])

    # Upcoming IP deadlines
    today = date.today()
    upcoming_deadlines = db.query(IPDeadline).filter(
        IPDeadline.completed == False,
        IPDeadline.due_date >= today
    ).order_by(IPDeadline.due_date).limit(5).all()

    # Milestone stats
    milestones = db.query(Milestone).all()
    in_progress = len([m for m in milestones if m.status == "in_progress"])
    completed = len([m for m in milestones if m.status == "completed"])
    recent = db.query(Milestone).order_by(Milestone.created_at.desc()).limit(5).all()

    return ProjectsDashboard(
        total_ip_assets=total_ip,
        pending_ip=pending_ip,
        granted_ip=granted_ip,
        upcoming_ip_deadlines=upcoming_deadlines,
        milestones_in_progress=in_progress,
        milestones_completed=completed,
        recent_milestones=recent
    )


# --- IP Assets ---

@router.get("/ip-assets", response_model=list[IPAssetListResponse])
async def list_ip_assets(
    type: str = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("projects.view"))
):
    """List all IP assets."""
    query = db.query(IPAsset)
    if type:
        query = query.filter(IPAsset.type == type)
    if status:
        query = query.filter(IPAsset.status == status)
    return query.order_by(IPAsset.created_at.desc()).all()


@router.post("/ip-assets", response_model=IPAssetResponse, status_code=status.HTTP_201_CREATED)
async def create_ip_asset(
    request: Request,
    data: IPAssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("projects.ip.create"))
):
    """Create a new IP asset."""
    if data.type not in IP_ASSET_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid type. Valid: {IP_ASSET_TYPES}",
        )

    ip_asset = IPAsset(
        type=data.type,
        title=data.title,
        filing_number=data.filing_number,
        priority_date=data.priority_date,
        filing_date=data.filing_date,
        inventors=data.inventors,
        document_path=data.document_path,
        notes=data.notes,
        created_by=current_user.id
    )

    # Add deadlines
    for dl_data in data.deadlines:
        deadline = IPDeadline(
            type=dl_data.type,
            due_date=dl_data.due_date,
            notes=dl_data.notes
        )
        ip_asset.deadlines.append(deadline)

    db.add(ip_asset)
    db.commit()
    db.refresh(ip_asset)

    # Log action
    service = IAMService(db)
    ip, ua = get_client_info(request)
    service.log_action(
        "ip_asset.created",
        user=current_user,
        resource_type="ip_asset",
        resource_id=ip_asset.id,
        new_value={"title": ip_asset.title, "type": ip_asset.type},
        ip_address=ip,
        user_agent=ua
    )

    return ip_asset


@router.get("/ip-assets/{asset_id}", response_model=IPAssetResponse)
async def get_ip_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("projects.view"))
):
    """Get IP asset by ID."""
    ip_asset = db.query(IPAsset).filter(IPAsset.id == asset_id).first()
    if not ip_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="IP asset not found",
        )
    return ip_asset


@router.put("/ip-assets/{asset_id}", response_model=IPAssetResponse)
async def update_ip_asset(
    asset_id: int,
    request: Request,
    data: IPAssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("projects.ip.edit"))
):
    """Update IP asset."""
    ip_asset = db.query(IPAsset).filter(IPAsset.id == asset_id).first()
    if not ip_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="IP asset not found",
        )

    if data.status and data.status not in IP_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Valid: {IP_STATUSES}",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ip_asset, key, value)

    db.commit()
    db.refresh(ip_asset)

    # Log action
    service = IAMService(db)
    ip, ua = get_client_info(request)
    service.log_action(
        "ip_asset.updated",
        user=current_user,
        resource_type="ip_asset",
        resource_id=ip_asset.id,
        new_value=update_data,
        ip_address=ip,
        user_agent=ua
    )

    return ip_asset


@router.post("/ip-assets/{asset_id}/deadlines", response_model=IPDeadlineResponse)
async def add_ip_deadline(
    asset_id: int,
    data: IPDeadlineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("projects.ip.edit"))
):
    """Add deadline to IP asset."""
    ip_asset = db.query(IPAsset).filter(IPAsset.id == asset_id).first()
    if not ip_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="IP asset not found",
        )

    deadline = IPDeadline(
        ip_asset_id=asset_id,
        type=data.type,
        due_date=data.due_date,
        notes=data.notes
    )
    db.add(deadline)
    db.commit()
    db.refresh(deadline)

    return deadline


@router.put("/ip-deadlines/{deadline_id}")
async def update_ip_deadline(
    deadline_id: int,
    completed: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("projects.ip.edit"))
):
    """Mark IP deadline as completed."""
    deadline = db.query(IPDeadline).filter(IPDeadline.id == deadline_id).first()
    if not deadline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deadline not found",
        )

    deadline.completed = completed
    deadline.completed_date = date.today() if completed else None
    db.commit()

    return {"message": "Deadline updated"}


# --- Milestones ---

@router.get("/milestones", response_model=list[MilestoneResponse])
async def list_milestones(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("projects.view"))
):
    """List all milestones."""
    query = db.query(Milestone)
    if status:
        query = query.filter(Milestone.status == status)
    return query.order_by(Milestone.phase, Milestone.target_date).all()


@router.post("/milestones", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
async def create_milestone(
    request: Request,
    data: MilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("projects.milestones.manage"))
):
    """Create a new milestone."""
    milestone = Milestone(
        phase=data.phase,
        title=data.title,
        description=data.description,
        target_date=data.target_date,
        deliverables=data.deliverables
    )

    db.add(milestone)
    db.commit()
    db.refresh(milestone)

    # Log action
    service = IAMService(db)
    ip, ua = get_client_info(request)
    service.log_action(
        "milestone.created",
        user=current_user,
        resource_type="milestone",
        resource_id=milestone.id,
        new_value={"title": milestone.title, "phase": milestone.phase},
        ip_address=ip,
        user_agent=ua
    )

    return milestone


@router.put("/milestones/{milestone_id}", response_model=MilestoneResponse)
async def update_milestone(
    milestone_id: int,
    request: Request,
    data: MilestoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("projects.milestones.manage"))
):
    """Update milestone."""
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found",
        )

    if data.status and data.status not in MILESTONE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Valid: {MILESTONE_STATUSES}",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(milestone, key, value)

    db.commit()
    db.refresh(milestone)

    # Log action
    service = IAMService(db)
    ip, ua = get_client_info(request)
    service.log_action(
        "milestone.updated",
        user=current_user,
        resource_type="milestone",
        resource_id=milestone.id,
        new_value=update_data,
        ip_address=ip,
        user_agent=ua
    )

    return milestone
