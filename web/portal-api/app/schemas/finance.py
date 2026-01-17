"""Pydantic schemas for Finance module."""
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


# --- Invoice Schemas ---

class InvoiceItemBase(BaseModel):
    """Base invoice item fields."""
    description: str = Field(..., min_length=1, max_length=500)
    quantity: Decimal = Field(default=Decimal("1"), ge=0)
    unit_price: Decimal = Field(..., ge=0)
    vat_rate: int = Field(default=21, ge=0, le=100)


class InvoiceItemCreate(InvoiceItemBase):
    """Create invoice item."""
    pass


class InvoiceItemResponse(InvoiceItemBase):
    """Invoice item response."""
    id: int
    line_total: Decimal
    line_vat: Decimal

    class Config:
        from_attributes = True


class InvoiceBase(BaseModel):
    """Base invoice fields."""
    number: str = Field(..., min_length=1, max_length=50)
    date: date
    due_date: date
    client_name: str = Field(..., min_length=1, max_length=255)
    client_kvk: Optional[str] = Field(None, max_length=20)
    client_vat: Optional[str] = Field(None, max_length=50)
    client_address: Optional[str] = None
    payment_reference: Optional[str] = Field(None, max_length=100)
    iban: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None


class InvoiceCreate(InvoiceBase):
    """Create invoice request."""
    items: list[InvoiceItemCreate] = []


class InvoiceUpdate(BaseModel):
    """Update invoice request."""
    number: Optional[str] = Field(None, min_length=1, max_length=50)
    date: Optional[date] = None
    due_date: Optional[date] = None
    client_name: Optional[str] = Field(None, min_length=1, max_length=255)
    client_kvk: Optional[str] = None
    client_vat: Optional[str] = None
    client_address: Optional[str] = None
    status: Optional[str] = None
    payment_reference: Optional[str] = None
    iban: Optional[str] = None
    notes: Optional[str] = None
    items: Optional[list[InvoiceItemCreate]] = None


class InvoiceResponse(InvoiceBase):
    """Invoice response."""
    id: int
    subtotal: Decimal
    vat_amount: Decimal
    total: Decimal
    status: str
    created_at: datetime
    items: list[InvoiceItemResponse] = []

    class Config:
        from_attributes = True


class InvoiceListResponse(BaseModel):
    """Invoice list item (without items)."""
    id: int
    number: str
    date: date
    due_date: date
    client_name: str
    total: Decimal
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Expense Schemas ---

class ExpenseBase(BaseModel):
    """Base expense fields."""
    date: date
    category: str = Field(..., min_length=1, max_length=50)
    amount: Decimal = Field(..., ge=0)
    vat_reclaimable: Decimal = Field(default=Decimal("0"), ge=0)
    description: Optional[str] = None
    receipt_path: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    """Create expense request."""
    pass


class ExpenseUpdate(BaseModel):
    """Update expense request."""
    date: Optional[date] = None
    category: Optional[str] = None
    amount: Optional[Decimal] = None
    vat_reclaimable: Optional[Decimal] = None
    description: Optional[str] = None
    receipt_path: Optional[str] = None
    status: Optional[str] = None


class ExpenseResponse(ExpenseBase):
    """Expense response."""
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Tax Deadline Schemas ---

class TaxDeadlineBase(BaseModel):
    """Base tax deadline fields."""
    type: str
    year: int
    due_date: date
    notes: Optional[str] = None


class TaxDeadlineCreate(TaxDeadlineBase):
    """Create tax deadline request."""
    pass


class TaxDeadlineUpdate(BaseModel):
    """Update tax deadline request."""
    status: Optional[str] = None
    extension_requested: Optional[bool] = None
    filed_date: Optional[date] = None
    notes: Optional[str] = None


class TaxDeadlineResponse(TaxDeadlineBase):
    """Tax deadline response."""
    id: int
    status: str
    extension_requested: bool
    filed_date: Optional[date]

    class Config:
        from_attributes = True


# --- Dashboard Schemas ---

class FinanceDashboard(BaseModel):
    """Finance dashboard KPIs."""
    total_invoiced: Decimal
    total_paid: Decimal
    total_outstanding: Decimal
    total_overdue: Decimal
    total_expenses: Decimal
    total_vat_reclaimable: Decimal
    upcoming_deadlines: list[TaxDeadlineResponse]
    recent_invoices: list[InvoiceListResponse]

class VATSummary(BaseModel):
    """VAT summary for a period."""
    period: str
    vat_collected: Decimal
    vat_paid: Decimal
    vat_balance: Decimal
