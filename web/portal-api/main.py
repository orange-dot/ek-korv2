"""
Elektrokombinacija Portal API

FastAPI application for internal startup management.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db, SessionLocal
from app.routers import auth
from app.routers.finance import router as finance_router
from app.routers.projects import router as projects_router
from app.routers.team import router as team_router
from app.iam.router import router as iam_router
from app.iam.service import IAMService

# Import all models to register them with SQLAlchemy
from app.iam.models import User, Role, Permission, Invite, AuditLog, RefreshToken
from app.models.invoice import Invoice, InvoiceItem
from app.models.expense import Expense
from app.models.tax_deadline import TaxDeadline
from app.models.ip_asset import IPAsset, IPDeadline
from app.models.milestone import Milestone
from app.models.team_member import TeamMember, Equity, Contract

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown."""
    # Startup
    print("Starting Elektrokombinacija Portal API...")

    # Initialize database
    init_db()

    # Seed default data
    db = SessionLocal()
    try:
        service = IAMService(db)
        service.seed_all()
        print("Database initialized and seeded.")
    finally:
        db.close()

    yield

    # Shutdown
    print("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Elektrokombinacija Portal API",
    description="Internal startup management portal with IAM, Finance, Projects, and Team modules.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        settings.app_url,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(iam_router, prefix="/api/v1")
app.include_router(finance_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")
app.include_router(team_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Elektrokombinacija Portal API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=settings.debug
    )
