"""IAM management endpoints - users, roles, invites, audit."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from ..database import get_db
from .models import User
from .schemas import (
    UserResponse, UserCreate, UserUpdate, UserRolesUpdate,
    RoleResponse, RoleDetailResponse, RoleCreate, RoleUpdate,
    PermissionResponse,
    InviteResponse, InviteCreate,
    AuditLogResponse, AuditLogQuery
)
from .service import IAMService
from .dependencies import get_current_user, require_permission, get_client_info

router = APIRouter(prefix="/iam", tags=["IAM"])


# --- Users ---

@router.get("/users", response_model=list[UserResponse])
async def list_users(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("iam.users.view"))
):
    """List all users."""
    service = IAMService(db)
    return service.list_users(include_inactive=include_inactive)


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    request: Request,
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("iam.users.create"))
):
    """Create a new user."""
    service = IAMService(db)

    # Check if email exists
    existing = service.get_user_by_email(data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = service.create_user(
        email=data.email,
        password=data.password,
        name=data.name,
        role_ids=data.role_ids
    )

    # Log action
    ip, ua = get_client_info(request)
    service.log_action(
        "user.created",
        user=current_user,
        resource_type="user",
        resource_id=user.id,
        new_value={"email": user.email, "name": user.name},
        ip_address=ip,
        user_agent=ua
    )

    return user


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("iam.users.view"))
):
    """Get user by ID."""
    service = IAMService(db)
    user = service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    request: Request,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("iam.users.update"))
):
    """Update user details."""
    service = IAMService(db)
    user = service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    old_data = {"name": user.name, "is_active": user.is_active}
    user = service.update_user(user, **data.model_dump(exclude_unset=True))

    # Log action
    ip, ua = get_client_info(request)
    service.log_action(
        "user.updated",
        user=current_user,
        resource_type="user",
        resource_id=user.id,
        old_value=old_data,
        new_value=data.model_dump(exclude_unset=True),
        ip_address=ip,
        user_agent=ua
    )

    return user


@router.delete("/users/{user_id}")
async def deactivate_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("iam.users.delete"))
):
    """Deactivate user account."""
    service = IAMService(db)
    user = service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate superadmin",
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate yourself",
        )

    service.deactivate_user(user)

    # Log action
    ip, ua = get_client_info(request)
    service.log_action(
        "user.deactivated",
        user=current_user,
        resource_type="user",
        resource_id=user.id,
        ip_address=ip,
        user_agent=ua
    )

    return {"message": "User deactivated"}


@router.put("/users/{user_id}/roles", response_model=UserResponse)
async def update_user_roles(
    user_id: int,
    request: Request,
    data: UserRolesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("iam.users.update"))
):
    """Update user's roles."""
    service = IAMService(db)
    user = service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    old_roles = [r.name for r in user.roles]
    user = service.update_user_roles(user, data.role_ids)
    new_roles = [r.name for r in user.roles]

    # Log action
    ip, ua = get_client_info(request)
    service.log_action(
        "user.roles_updated",
        user=current_user,
        resource_type="user",
        resource_id=user.id,
        old_value={"roles": old_roles},
        new_value={"roles": new_roles},
        ip_address=ip,
        user_agent=ua
    )

    return user


# --- Roles ---

@router.get("/roles", response_model=list[RoleResponse])
async def list_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all roles."""
    service = IAMService(db)
    return service.list_roles()


@router.get("/roles/{role_id}", response_model=RoleDetailResponse)
async def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get role with permissions."""
    service = IAMService(db)
    role = service.get_role_by_id(role_id)

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )

    return role


@router.post("/roles", response_model=RoleDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    request: Request,
    data: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("iam.roles.manage"))
):
    """Create a new role."""
    service = IAMService(db)

    # Check if name exists
    existing = service.get_role_by_name(data.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role name already exists",
        )

    role = service.create_role(
        name=data.name,
        description=data.description,
        permission_ids=data.permission_ids
    )

    # Log action
    ip, ua = get_client_info(request)
    service.log_action(
        "role.created",
        user=current_user,
        resource_type="role",
        resource_id=role.id,
        new_value={"name": role.name},
        ip_address=ip,
        user_agent=ua
    )

    return role


@router.put("/roles/{role_id}", response_model=RoleDetailResponse)
async def update_role(
    role_id: int,
    request: Request,
    data: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("iam.roles.manage"))
):
    """Update role."""
    service = IAMService(db)
    role = service.get_role_by_id(role_id)

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )

    if role.is_system and data.name and data.name != role.name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot rename system role",
        )

    role = service.update_role(role, **data.model_dump(exclude_unset=True))

    # Log action
    ip, ua = get_client_info(request)
    service.log_action(
        "role.updated",
        user=current_user,
        resource_type="role",
        resource_id=role.id,
        new_value=data.model_dump(exclude_unset=True),
        ip_address=ip,
        user_agent=ua
    )

    return role


@router.delete("/roles/{role_id}")
async def delete_role(
    role_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("iam.roles.manage"))
):
    """Delete role (non-system roles only)."""
    service = IAMService(db)
    role = service.get_role_by_id(role_id)

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )

    if role.is_system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete system role",
        )

    role_name = role.name
    service.delete_role(role)

    # Log action
    ip, ua = get_client_info(request)
    service.log_action(
        "role.deleted",
        user=current_user,
        resource_type="role",
        resource_id=role_id,
        old_value={"name": role_name},
        ip_address=ip,
        user_agent=ua
    )

    return {"message": "Role deleted"}


# --- Permissions ---

@router.get("/permissions", response_model=list[PermissionResponse])
async def list_permissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all available permissions."""
    service = IAMService(db)
    return service.list_permissions()


# --- Invites ---

@router.get("/invites", response_model=list[InviteResponse])
async def list_invites(
    include_used: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("iam.invites.send"))
):
    """List pending invites."""
    service = IAMService(db)
    return service.list_invites(include_used=include_used)


@router.post("/invites", response_model=InviteResponse, status_code=status.HTTP_201_CREATED)
async def create_invite(
    request: Request,
    data: InviteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("iam.invites.send"))
):
    """Create a new invite."""
    service = IAMService(db)

    # Check if email already exists
    existing_user = service.get_user_by_email(data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    # Check if role exists
    role = service.get_role_by_id(data.role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role not found",
        )

    invite = service.create_invite(
        email=data.email,
        role_id=data.role_id,
        invited_by=current_user
    )

    # Log action
    ip, ua = get_client_info(request)
    service.log_action(
        "invite.created",
        user=current_user,
        resource_type="invite",
        resource_id=invite.id,
        new_value={"email": invite.email, "role": role.name},
        ip_address=ip,
        user_agent=ua
    )

    return invite


@router.delete("/invites/{invite_id}")
async def delete_invite(
    invite_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("iam.invites.send"))
):
    """Revoke an invite."""
    service = IAMService(db)
    invite = db.query(service.db.query(type(service)).filter_by(id=invite_id).first())

    # Query directly
    from .models import Invite
    invite = db.query(Invite).filter(Invite.id == invite_id).first()

    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invite not found",
        )

    invite_email = invite.email
    service.delete_invite(invite)

    # Log action
    ip, ua = get_client_info(request)
    service.log_action(
        "invite.revoked",
        user=current_user,
        resource_type="invite",
        resource_id=invite_id,
        old_value={"email": invite_email},
        ip_address=ip,
        user_agent=ua
    )

    return {"message": "Invite revoked"}


# --- Audit Log ---

@router.get("/audit", response_model=list[AuditLogResponse])
async def query_audit_log(
    user_id: int = None,
    action: str = None,
    resource_type: str = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("iam.audit.view"))
):
    """Query audit log."""
    service = IAMService(db)
    logs = service.query_audit_log(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        limit=limit,
        offset=offset
    )

    # Add user email to response
    results = []
    for log in logs:
        result = AuditLogResponse(
            id=log.id,
            user_id=log.user_id,
            user_email=log.user.email if log.user else None,
            action=log.action,
            resource_type=log.resource_type,
            resource_id=log.resource_id,
            old_value=log.old_value,
            new_value=log.new_value,
            ip_address=log.ip_address,
            created_at=log.created_at
        )
        results.append(result)

    return results
