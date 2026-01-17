"""Basic API tests."""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Elektrokombinacija Portal API"
    assert data["status"] == "running"


def test_health():
    """Test health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_login_invalid():
    """Test login with invalid credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "invalid@test.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_login_superadmin():
    """Test login with superadmin credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@elektrokombinacija.com", "password": "changeme123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_protected_endpoint_no_auth():
    """Test protected endpoint without auth."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_protected_endpoint_with_auth():
    """Test protected endpoint with auth."""
    # Login first
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@elektrokombinacija.com", "password": "changeme123"}
    )
    token = login_response.json()["access_token"]

    # Access protected endpoint
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@elektrokombinacija.com"
    assert data["is_superadmin"] == True
    assert "*" in data["permissions"]  # Superadmin has all permissions


def test_roles_list():
    """Test listing roles."""
    # Login
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@elektrokombinacija.com", "password": "changeme123"}
    )
    token = login_response.json()["access_token"]

    # List roles
    response = client.get(
        "/api/v1/iam/roles",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    roles = response.json()
    assert len(roles) >= 5  # admin, founder, accountant, developer, advisor
    role_names = [r["name"] for r in roles]
    assert "admin" in role_names
    assert "founder" in role_names


def test_permissions_list():
    """Test listing permissions."""
    # Login
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@elektrokombinacija.com", "password": "changeme123"}
    )
    token = login_response.json()["access_token"]

    # List permissions
    response = client.get(
        "/api/v1/iam/permissions",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    permissions = response.json()
    assert len(permissions) > 0
    perm_names = [p["name"] for p in permissions]
    assert "finance.view" in perm_names
    assert "projects.view" in perm_names
    assert "team.view" in perm_names
