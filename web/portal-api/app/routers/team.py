"""Team endpoints - members, equity, contracts."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..iam.models import User
from ..iam.dependencies import get_current_user, require_permission, get_client_info
from ..iam.service import IAMService
from ..models.team_member import TeamMember, Equity, Contract, MEMBER_STATUSES, CONTRACT_TYPES
from ..schemas.team import (
    TeamMemberCreate, TeamMemberUpdate, TeamMemberResponse,
    EquityCreate, EquityUpdate, EquityResponse, EquityWithMemberResponse,
    ContractCreate, ContractUpdate, ContractResponse,
    TeamDashboard, CapTable, CapTableEntry
)

router = APIRouter(prefix="/team", tags=["Team"])


# --- Dashboard ---

@router.get("/dashboard", response_model=TeamDashboard)
async def get_team_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("team.view"))
):
    """Get team dashboard."""
    members = db.query(TeamMember).all()

    total = len(members)
    active = len([m for m in members if m.status == "active"])
    advisors = len([m for m in members if m.status == "advisor"])

    # Equity stats
    equity_grants = db.query(Equity).all()
    total_shares = sum(e.shares for e in equity_grants)
    total_vested = sum(e.vested_shares for e in equity_grants)

    return TeamDashboard(
        total_members=total,
        active_members=active,
        advisors=advisors,
        total_shares_issued=total_shares,
        total_shares_vested=total_vested,
        members=members
    )


# --- Team Members ---

@router.get("/members", response_model=list[TeamMemberResponse])
async def list_members(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("team.view"))
):
    """List all team members."""
    query = db.query(TeamMember)
    if status:
        query = query.filter(TeamMember.status == status)
    return query.order_by(TeamMember.name).all()


@router.post("/members", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
async def create_member(
    request: Request,
    data: TeamMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("team.members.manage"))
):
    """Add a new team member."""
    member = TeamMember(
        user_id=data.user_id,
        name=data.name,
        role=data.role,
        email=data.email,
        start_date=data.start_date,
        residency=data.residency,
        notes=data.notes
    )

    db.add(member)
    db.commit()
    db.refresh(member)

    # Log action
    service = IAMService(db)
    ip, ua = get_client_info(request)
    service.log_action(
        "team_member.created",
        user=current_user,
        resource_type="team_member",
        resource_id=member.id,
        new_value={"name": member.name, "role": member.role},
        ip_address=ip,
        user_agent=ua
    )

    return member


@router.get("/members/{member_id}", response_model=TeamMemberResponse)
async def get_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("team.view"))
):
    """Get team member by ID."""
    member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found",
        )
    return member


@router.put("/members/{member_id}", response_model=TeamMemberResponse)
async def update_member(
    member_id: int,
    request: Request,
    data: TeamMemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("team.members.manage"))
):
    """Update team member."""
    member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found",
        )

    if data.status and data.status not in MEMBER_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Valid: {MEMBER_STATUSES}",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(member, key, value)

    db.commit()
    db.refresh(member)

    # Log action
    service = IAMService(db)
    ip, ua = get_client_info(request)
    service.log_action(
        "team_member.updated",
        user=current_user,
        resource_type="team_member",
        resource_id=member.id,
        new_value=update_data,
        ip_address=ip,
        user_agent=ua
    )

    return member


# --- Equity ---

@router.get("/equity", response_model=list[EquityWithMemberResponse])
async def list_equity(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("team.equity.view"))
):
    """List all equity grants."""
    grants = db.query(Equity).all()
    results = []
    for grant in grants:
        result = EquityWithMemberResponse(
            id=grant.id,
            member_id=grant.member_id,
            member_name=grant.member.name,
            shares=grant.shares,
            share_class=grant.share_class,
            vesting_start=grant.vesting_start,
            vesting_months=grant.vesting_months,
            cliff_months=grant.cliff_months,
            grant_date=grant.grant_date,
            vested_shares=grant.vested_shares
        )
        results.append(result)
    return results


@router.post("/equity", response_model=EquityResponse, status_code=status.HTTP_201_CREATED)
async def create_equity(
    request: Request,
    data: EquityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("team.equity.manage"))
):
    """Create equity grant."""
    # Verify member exists
    member = db.query(TeamMember).filter(TeamMember.id == data.member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found",
        )

    equity = Equity(
        member_id=data.member_id,
        shares=data.shares,
        share_class=data.share_class,
        vesting_start=data.vesting_start,
        vesting_months=data.vesting_months,
        cliff_months=data.cliff_months,
        grant_date=data.grant_date
    )

    db.add(equity)
    db.commit()
    db.refresh(equity)

    # Log action
    service = IAMService(db)
    ip, ua = get_client_info(request)
    service.log_action(
        "equity.created",
        user=current_user,
        resource_type="equity",
        resource_id=equity.id,
        new_value={"member": member.name, "shares": equity.shares},
        ip_address=ip,
        user_agent=ua
    )

    return equity


@router.get("/equity/cap-table", response_model=CapTable)
async def get_cap_table(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("team.equity.view"))
):
    """Get cap table."""
    grants = db.query(Equity).all()

    # Aggregate by member
    member_shares = {}
    for grant in grants:
        mid = grant.member_id
        if mid not in member_shares:
            member_shares[mid] = {
                "member": grant.member,
                "total": 0,
                "vested": 0
            }
        member_shares[mid]["total"] += grant.shares
        member_shares[mid]["vested"] += grant.vested_shares

    total_shares = sum(m["total"] for m in member_shares.values())

    entries = []
    for mid, data in member_shares.items():
        percent = (data["total"] / total_shares * 100) if total_shares > 0 else 0
        entries.append(CapTableEntry(
            member_id=mid,
            member_name=data["member"].name,
            role=data["member"].role,
            total_shares=data["total"],
            vested_shares=data["vested"],
            ownership_percent=round(percent, 2)
        ))

    # Sort by ownership
    entries.sort(key=lambda x: x.total_shares, reverse=True)

    return CapTable(
        total_shares=total_shares,
        entries=entries
    )


# --- Contracts ---

@router.get("/contracts", response_model=list[ContractResponse])
async def list_contracts(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("team.view"))
):
    """List all contracts."""
    query = db.query(Contract)
    if status:
        query = query.filter(Contract.status == status)
    return query.order_by(Contract.start_date.desc()).all()


@router.post("/contracts", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
async def create_contract(
    request: Request,
    data: ContractCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("team.contracts.manage"))
):
    """Create contract."""
    # Verify member exists
    member = db.query(TeamMember).filter(TeamMember.id == data.member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found",
        )

    if data.type not in CONTRACT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid type. Valid: {CONTRACT_TYPES}",
        )

    contract = Contract(
        member_id=data.member_id,
        type=data.type,
        start_date=data.start_date,
        end_date=data.end_date,
        document_path=data.document_path
    )

    db.add(contract)
    db.commit()
    db.refresh(contract)

    # Log action
    service = IAMService(db)
    ip, ua = get_client_info(request)
    service.log_action(
        "contract.created",
        user=current_user,
        resource_type="contract",
        resource_id=contract.id,
        new_value={"member": member.name, "type": contract.type},
        ip_address=ip,
        user_agent=ua
    )

    return contract


@router.put("/contracts/{contract_id}", response_model=ContractResponse)
async def update_contract(
    contract_id: int,
    request: Request,
    data: ContractUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("team.contracts.manage"))
):
    """Update contract."""
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(contract, key, value)

    db.commit()
    db.refresh(contract)

    return contract
