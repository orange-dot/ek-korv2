"""IAM database models - User, Role, Permission, Invite, AuditLog."""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Table
)
from sqlalchemy.orm import relationship
from ..database import Base


# Many-to-Many: Role <-> Permission
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True)
)

# Many-to-Many: User <-> Role
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)
)


class User(Base):
    """User account."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superadmin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    invites_sent = relationship("Invite", back_populates="invited_by_user", foreign_keys="Invite.invited_by")
    audit_logs = relationship("AuditLog", back_populates="user")

    def get_permissions(self) -> set[str]:
        """Get all permissions for this user (from all roles)."""
        if self.is_superadmin:
            return {"*"}  # Superadmin has all permissions

        permissions = set()
        for role in self.roles:
            for perm in role.permissions:
                permissions.add(perm.name)
        return permissions

    def has_permission(self, permission: str) -> bool:
        """Check if user has a specific permission."""
        if self.is_superadmin:
            return True

        user_perms = self.get_permissions()

        # Check exact match
        if permission in user_perms:
            return True

        # Check wildcard (e.g., "finance.*" matches "finance.invoices.create")
        parts = permission.split(".")
        for i in range(len(parts)):
            wildcard = ".".join(parts[:i+1]) + ".*"
            if wildcard in user_perms:
                return True

        # Check resource-level wildcard (e.g., "*.view")
        if f"*.{parts[-1]}" in user_perms:
            return True

        return False


class Role(Base):
    """Role with associated permissions."""
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    is_system = Column(Boolean, default=False)  # System roles cannot be deleted
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    users = relationship("User", secondary=user_roles, back_populates="roles")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")
    invites = relationship("Invite", back_populates="role")


class Permission(Base):
    """Permission definition."""
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)  # e.g., "finance.invoices.create"
    resource = Column(String(50), nullable=False)  # e.g., "finance"
    action = Column(String(50), nullable=False)  # e.g., "invoices.create"
    description = Column(String(255), nullable=True)

    # Relationships
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")


class Invite(Base):
    """User invitation with role assignment."""
    __tablename__ = "invites"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False)
    token = Column(String(255), unique=True, nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    invited_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    role = relationship("Role", back_populates="invites")
    invited_by_user = relationship("User", back_populates="invites_sent", foreign_keys=[invited_by])

    @property
    def is_expired(self) -> bool:
        """Check if invite has expired."""
        return datetime.utcnow() > self.expires_at

    @property
    def is_used(self) -> bool:
        """Check if invite has been used."""
        return self.used_at is not None


class AuditLog(Base):
    """Audit log for tracking all user actions."""
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False, index=True)  # e.g., "user.login", "invoice.create"
    resource_type = Column(String(50), nullable=True)  # e.g., "invoice", "user"
    resource_id = Column(Integer, nullable=True)
    old_value = Column(Text, nullable=True)  # JSON of previous state
    new_value = Column(Text, nullable=True)  # JSON of new state
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")


class RefreshToken(Base):
    """JWT refresh tokens for session management."""
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="refresh_tokens")

    @property
    def is_valid(self) -> bool:
        """Check if token is valid (not expired and not revoked)."""
        return not self.revoked and datetime.utcnow() < self.expires_at
