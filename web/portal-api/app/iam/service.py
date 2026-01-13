"""IAM service - business logic for users, roles, invites."""
import json
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from ..config import get_settings
from ..utils.security import (
    get_password_hash, verify_password,
    create_access_token, create_refresh_token, generate_invite_token
)
from .models import User, Role, Permission, Invite, AuditLog, RefreshToken
from .permissions import PERMISSIONS, ROLE_PERMISSIONS, ROLE_DESCRIPTIONS

settings = get_settings()


class IAMService:
    """Service for IAM operations."""

    def __init__(self, db: Session):
        self.db = db

    # --- User Operations ---

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.db.query(User).filter(User.email == email.lower()).first()

    def list_users(self, include_inactive: bool = False) -> list[User]:
        """List all users."""
        query = self.db.query(User)
        if not include_inactive:
            query = query.filter(User.is_active == True)
        return query.order_by(User.name).all()

    def create_user(
        self,
        email: str,
        password: str,
        name: str,
        role_ids: list[int] = None,
        is_superadmin: bool = False
    ) -> User:
        """Create a new user."""
        user = User(
            email=email.lower(),
            hashed_password=get_password_hash(password),
            name=name,
            is_superadmin=is_superadmin
        )

        if role_ids:
            roles = self.db.query(Role).filter(Role.id.in_(role_ids)).all()
            user.roles = roles

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_user(self, user: User, **kwargs) -> User:
        """Update user fields."""
        for key, value in kwargs.items():
            if hasattr(user, key) and value is not None:
                setattr(user, key, value)
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_user_roles(self, user: User, role_ids: list[int]) -> User:
        """Update user's roles."""
        roles = self.db.query(Role).filter(Role.id.in_(role_ids)).all()
        user.roles = roles
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        return user

    def deactivate_user(self, user: User) -> User:
        """Deactivate a user account."""
        user.is_active = False
        user.updated_at = datetime.utcnow()
        # Revoke all refresh tokens
        self.db.query(RefreshToken).filter(
            RefreshToken.user_id == user.id
        ).update({"revoked": True})
        self.db.commit()
        self.db.refresh(user)
        return user

    def change_password(self, user: User, new_password: str) -> User:
        """Change user's password."""
        user.hashed_password = get_password_hash(new_password)
        user.updated_at = datetime.utcnow()
        # Revoke all refresh tokens (force re-login)
        self.db.query(RefreshToken).filter(
            RefreshToken.user_id == user.id
        ).update({"revoked": True})
        self.db.commit()
        self.db.refresh(user)
        return user

    # --- Authentication ---

    def authenticate(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = self.get_user_by_email(email)
        if not user or not user.is_active:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def create_tokens(self, user: User) -> tuple[str, str, int]:
        """Create access and refresh tokens for user."""
        # Update last login
        user.last_login = datetime.utcnow()
        self.db.commit()

        # Create access token
        access_token = create_access_token({"sub": str(user.id)})
        expires_in = settings.access_token_expire_minutes * 60

        # Create refresh token
        refresh_token, expires_at = create_refresh_token()
        token_record = RefreshToken(
            user_id=user.id,
            token=refresh_token,
            expires_at=expires_at
        )
        self.db.add(token_record)
        self.db.commit()

        return access_token, refresh_token, expires_in

    def refresh_access_token(self, refresh_token: str) -> Optional[tuple[str, int]]:
        """Refresh access token using refresh token."""
        token_record = self.db.query(RefreshToken).filter(
            RefreshToken.token == refresh_token
        ).first()

        if not token_record or not token_record.is_valid:
            return None

        user = token_record.user
        if not user or not user.is_active:
            return None

        access_token = create_access_token({"sub": str(user.id)})
        expires_in = settings.access_token_expire_minutes * 60

        return access_token, expires_in

    def revoke_refresh_token(self, refresh_token: str) -> bool:
        """Revoke a refresh token (logout)."""
        result = self.db.query(RefreshToken).filter(
            RefreshToken.token == refresh_token
        ).update({"revoked": True})
        self.db.commit()
        return result > 0

    # --- Role Operations ---

    def get_role_by_id(self, role_id: int) -> Optional[Role]:
        """Get role by ID."""
        return self.db.query(Role).filter(Role.id == role_id).first()

    def get_role_by_name(self, name: str) -> Optional[Role]:
        """Get role by name."""
        return self.db.query(Role).filter(Role.name == name).first()

    def list_roles(self) -> list[Role]:
        """List all roles."""
        return self.db.query(Role).order_by(Role.name).all()

    def create_role(
        self,
        name: str,
        description: str = None,
        permission_ids: list[int] = None,
        is_system: bool = False
    ) -> Role:
        """Create a new role."""
        role = Role(
            name=name,
            description=description,
            is_system=is_system
        )

        if permission_ids:
            permissions = self.db.query(Permission).filter(
                Permission.id.in_(permission_ids)
            ).all()
            role.permissions = permissions

        self.db.add(role)
        self.db.commit()
        self.db.refresh(role)
        return role

    def update_role(self, role: Role, **kwargs) -> Role:
        """Update role fields."""
        permission_ids = kwargs.pop("permission_ids", None)

        for key, value in kwargs.items():
            if hasattr(role, key) and value is not None:
                setattr(role, key, value)

        if permission_ids is not None:
            permissions = self.db.query(Permission).filter(
                Permission.id.in_(permission_ids)
            ).all()
            role.permissions = permissions

        self.db.commit()
        self.db.refresh(role)
        return role

    def delete_role(self, role: Role) -> bool:
        """Delete a role (if not system role)."""
        if role.is_system:
            return False
        self.db.delete(role)
        self.db.commit()
        return True

    # --- Permission Operations ---

    def list_permissions(self) -> list[Permission]:
        """List all permissions."""
        return self.db.query(Permission).order_by(Permission.resource, Permission.action).all()

    def get_permission_by_name(self, name: str) -> Optional[Permission]:
        """Get permission by name."""
        return self.db.query(Permission).filter(Permission.name == name).first()

    # --- Invite Operations ---

    def get_invite_by_token(self, token: str) -> Optional[Invite]:
        """Get invite by token."""
        return self.db.query(Invite).filter(Invite.token == token).first()

    def list_invites(self, include_used: bool = False) -> list[Invite]:
        """List pending invites."""
        query = self.db.query(Invite)
        if not include_used:
            query = query.filter(Invite.used_at == None)
        return query.order_by(Invite.created_at.desc()).all()

    def create_invite(
        self,
        email: str,
        role_id: int,
        invited_by: User
    ) -> Invite:
        """Create a new invite."""
        expires_at = datetime.utcnow() + timedelta(days=settings.invite_expire_days)

        invite = Invite(
            email=email.lower(),
            token=generate_invite_token(),
            role_id=role_id,
            invited_by=invited_by.id,
            expires_at=expires_at
        )

        self.db.add(invite)
        self.db.commit()
        self.db.refresh(invite)
        return invite

    def accept_invite(self, invite: Invite, name: str, password: str) -> User:
        """Accept invite and create user account."""
        if invite.is_expired or invite.is_used:
            raise ValueError("Invite is expired or already used")

        # Create user with assigned role
        user = User(
            email=invite.email,
            hashed_password=get_password_hash(password),
            name=name
        )

        if invite.role:
            user.roles = [invite.role]

        self.db.add(user)

        # Mark invite as used
        invite.used_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(user)
        return user

    def delete_invite(self, invite: Invite) -> bool:
        """Delete/revoke an invite."""
        self.db.delete(invite)
        self.db.commit()
        return True

    # --- Audit Log Operations ---

    def log_action(
        self,
        action: str,
        user: Optional[User] = None,
        resource_type: str = None,
        resource_id: int = None,
        old_value: dict = None,
        new_value: dict = None,
        ip_address: str = None,
        user_agent: str = None
    ) -> AuditLog:
        """Log an action to the audit log."""
        entry = AuditLog(
            user_id=user.id if user else None,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            old_value=json.dumps(old_value) if old_value else None,
            new_value=json.dumps(new_value) if new_value else None,
            ip_address=ip_address,
            user_agent=user_agent[:500] if user_agent else None
        )
        self.db.add(entry)
        self.db.commit()
        return entry

    def query_audit_log(
        self,
        user_id: int = None,
        action: str = None,
        resource_type: str = None,
        start_date: datetime = None,
        end_date: datetime = None,
        limit: int = 100,
        offset: int = 0
    ) -> list[AuditLog]:
        """Query audit log with filters."""
        query = self.db.query(AuditLog)

        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if action:
            query = query.filter(AuditLog.action.like(f"%{action}%"))
        if resource_type:
            query = query.filter(AuditLog.resource_type == resource_type)
        if start_date:
            query = query.filter(AuditLog.created_at >= start_date)
        if end_date:
            query = query.filter(AuditLog.created_at <= end_date)

        return query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()

    # --- Seed Data ---

    def seed_permissions(self):
        """Seed all permissions from PERMISSIONS constant."""
        for name, (resource, action, description) in PERMISSIONS.items():
            existing = self.get_permission_by_name(name)
            if not existing:
                perm = Permission(
                    name=name,
                    resource=resource,
                    action=action,
                    description=description
                )
                self.db.add(perm)
        self.db.commit()

    def seed_roles(self):
        """Seed default roles with permissions."""
        # First ensure permissions exist
        self.seed_permissions()

        for role_name, perm_names in ROLE_PERMISSIONS.items():
            existing = self.get_role_by_name(role_name)
            if not existing:
                # Get permission objects
                permissions = self.db.query(Permission).filter(
                    Permission.name.in_(perm_names)
                ).all()

                role = Role(
                    name=role_name,
                    description=ROLE_DESCRIPTIONS.get(role_name),
                    is_system=True
                )
                role.permissions = permissions
                self.db.add(role)

        self.db.commit()

    def seed_superadmin(self):
        """Create superadmin user if not exists."""
        existing = self.get_user_by_email(settings.superadmin_email)
        if not existing:
            self.create_user(
                email=settings.superadmin_email,
                password=settings.superadmin_password,
                name=settings.superadmin_name,
                is_superadmin=True
            )
            print(f"Created superadmin: {settings.superadmin_email}")

    def seed_all(self):
        """Seed all default data."""
        self.seed_permissions()
        self.seed_roles()
        self.seed_superadmin()
