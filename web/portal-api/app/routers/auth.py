"""Authentication endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..iam.models import User
from ..iam.schemas import (
    TokenResponse, LoginRequest, RefreshRequest,
    PasswordChangeRequest, UserMeResponse, InviteAcceptRequest
)
from ..iam.service import IAMService
from ..iam.dependencies import get_current_user, get_client_info
from ..utils.security import verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return tokens.

    - **email**: User email
    - **password**: User password

    Returns access token and refresh token.
    """
    service = IAMService(db)
    user = service.authenticate(data.email, data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token, refresh_token, expires_in = service.create_tokens(user)

    # Log the action
    ip, ua = get_client_info(request)
    service.log_action("user.login", user=user, ip_address=ip, user_agent=ua)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    data: RefreshRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.

    Returns new access token.
    """
    service = IAMService(db)
    result = service.refresh_access_token(data.refresh_token)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    access_token, expires_in = result

    return TokenResponse(
        access_token=access_token,
        refresh_token=data.refresh_token,  # Keep same refresh token
        expires_in=expires_in
    )


@router.post("/logout")
async def logout(
    request: Request,
    data: RefreshRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Logout user by revoking refresh token.
    """
    service = IAMService(db)
    service.revoke_refresh_token(data.refresh_token)

    # Log the action
    ip, ua = get_client_info(request)
    service.log_action("user.logout", user=current_user, ip_address=ip, user_agent=ua)

    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserMeResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user info with permissions.
    """
    permissions = list(current_user.get_permissions())

    return UserMeResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        is_active=current_user.is_active,
        is_superadmin=current_user.is_superadmin,
        roles=current_user.roles,
        permissions=permissions
    )


@router.post("/password")
async def change_password(
    request: Request,
    data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Change current user's password.
    """
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    service = IAMService(db)
    service.change_password(current_user, data.new_password)

    # Log the action
    ip, ua = get_client_info(request)
    service.log_action(
        "user.password_changed",
        user=current_user,
        resource_type="user",
        resource_id=current_user.id,
        ip_address=ip,
        user_agent=ua
    )

    return {"message": "Password changed successfully"}


@router.get("/invite/{token}")
async def get_invite_info(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Get invite information (public endpoint).
    """
    service = IAMService(db)
    invite = service.get_invite_by_token(token)

    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invite not found",
        )

    if invite.is_expired:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invite has expired",
        )

    if invite.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invite has already been used",
        )

    return {
        "email": invite.email,
        "role": invite.role.name if invite.role else None,
        "expires_at": invite.expires_at.isoformat()
    }


@router.post("/invite/{token}", response_model=TokenResponse)
async def accept_invite(
    token: str,
    request: Request,
    data: InviteAcceptRequest,
    db: Session = Depends(get_db)
):
    """
    Accept invite and create account.
    """
    service = IAMService(db)
    invite = service.get_invite_by_token(token)

    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invite not found",
        )

    if invite.is_expired:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invite has expired",
        )

    if invite.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invite has already been used",
        )

    # Check if email already exists
    existing = service.get_user_by_email(invite.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    try:
        user = service.accept_invite(invite, data.name, data.password)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Create tokens for immediate login
    access_token, refresh_token, expires_in = service.create_tokens(user)

    # Log the action
    ip, ua = get_client_info(request)
    service.log_action(
        "user.registered",
        user=user,
        resource_type="user",
        resource_id=user.id,
        new_value={"email": user.email, "name": user.name},
        ip_address=ip,
        user_agent=ua
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in
    )
