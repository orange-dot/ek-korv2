"""Pydantic schemas for IAM."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# --- Auth Schemas ---

class TokenResponse(BaseModel):
    """Response with access and refresh tokens."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class LoginRequest(BaseModel):
    """Login credentials."""
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    """Refresh token request."""
    refresh_token: str


class PasswordChangeRequest(BaseModel):
    """Password change request."""
    current_password: str
    new_password: str = Field(..., min_length=8)


# --- User Schemas ---

class UserBase(BaseModel):
    """Base user fields."""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)


class UserCreate(UserBase):
    """Create user request."""
    password: str = Field(..., min_length=8)
    role_ids: list[int] = []


class UserUpdate(BaseModel):
    """Update user request."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    is_active: Optional[bool] = None


class UserRolesUpdate(BaseModel):
    """Update user roles."""
    role_ids: list[int]


class UserResponse(UserBase):
    """User response with roles."""
    id: int
    is_active: bool
    is_superadmin: bool
    created_at: datetime
    last_login: Optional[datetime]
    roles: list["RoleResponse"] = []

    class Config:
        from_attributes = True


class UserMeResponse(UserBase):
    """Current user response with permissions."""
    id: int
    is_active: bool
    is_superadmin: bool
    roles: list["RoleResponse"] = []
    permissions: list[str] = []

    class Config:
        from_attributes = True


# --- Role Schemas ---

class RoleBase(BaseModel):
    """Base role fields."""
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=255)


class RoleCreate(RoleBase):
    """Create role request."""
    permission_ids: list[int] = []


class RoleUpdate(BaseModel):
    """Update role request."""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=255)
    permission_ids: Optional[list[int]] = None


class RoleResponse(RoleBase):
    """Role response."""
    id: int
    is_system: bool
    created_at: datetime

    class Config:
        from_attributes = True


class RoleDetailResponse(RoleResponse):
    """Role response with permissions."""
    permissions: list["PermissionResponse"] = []


# --- Permission Schemas ---

class PermissionResponse(BaseModel):
    """Permission response."""
    id: int
    name: str
    resource: str
    action: str
    description: Optional[str]

    class Config:
        from_attributes = True


# --- Invite Schemas ---

class InviteCreate(BaseModel):
    """Create invite request."""
    email: EmailStr
    role_id: int


class InviteResponse(BaseModel):
    """Invite response."""
    id: int
    email: str
    role: Optional[RoleResponse]
    expires_at: datetime
    is_expired: bool
    is_used: bool
    created_at: datetime

    class Config:
        from_attributes = True


class InviteAcceptRequest(BaseModel):
    """Accept invite and set password."""
    name: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=8)


# --- Audit Log Schemas ---

class AuditLogResponse(BaseModel):
    """Audit log entry response."""
    id: int
    user_id: Optional[int]
    user_email: Optional[str] = None
    action: str
    resource_type: Optional[str]
    resource_id: Optional[int]
    old_value: Optional[str]
    new_value: Optional[str]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AuditLogQuery(BaseModel):
    """Audit log query parameters."""
    user_id: Optional[int] = None
    action: Optional[str] = None
    resource_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = Field(default=100, le=1000)
    offset: int = Field(default=0, ge=0)


# Forward references
UserResponse.model_rebuild()
UserMeResponse.model_rebuild()
RoleDetailResponse.model_rebuild()
