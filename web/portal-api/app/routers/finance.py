"""Finance endpoints - invoices, expenses, tax deadlines."""
from datetime import date
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..iam.models import User
from ..iam.dependencies import get_current_user, require_permission, get_client_info
from ..iam.service import IAMService
from ..models.invoice import Invoice, InvoiceItem
from ..models.expense import Expense, EXPENSE_CATEGORIES
from ..models.tax_deadline import TaxDeadline, TAX_DEADLINE_TYPES
from ..schemas.finance import (
    InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceListResponse,
    ExpenseCreate, ExpenseUpdate, ExpenseResponse,
    TaxDeadlineCreate, TaxDeadlineUpdate, TaxDeadlineResponse,
    FinanceDashboard, VATSummary
)
from ..services.dutch_tax import seed_tax_deadlines, check_overdue_deadlines

router = APIRouter(prefix="/finance", tags=["Finance"])


# --- Dashboard ---

@router.get("/dashboard", response_model=FinanceDashboard)
async def get_finance_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("finance.view"))
):
    """Get finance dashboard with KPIs."""
    # Invoice totals
    invoices = db.query(Invoice).all()
    total_invoiced = sum(i.total or 0 for i in invoices)
    total_paid = sum(i.total or 0 for i in invoices if i.status == "paid")
    total_outstanding = sum(i.total or 0 for i in invoices if i.status in ("sent", "draft"))
    total_overdue = sum(i.total or 0 for i in invoices if i.status == "overdue")

    # Expense totals
    expenses = db.query(Expense).all()
    total_expenses = sum(e.amount or 0 for e in expenses)
    total_vat_reclaimable = sum(e.vat_reclaimable or 0 for e in expenses)

    # Upcoming deadlines
    today = date.today()
    upcoming = db.query(TaxDeadline).filter(
        TaxDeadline.status == "pending",
        TaxDeadline.due_date >= today
    ).order_by(TaxDeadline.due_date).limit(5).all()

    # Recent invoices
    recent = db.query(Invoice).order_by(Invoice.created_at.desc()).limit(5).all()

    return FinanceDashboard(
        total_invoiced=Decimal(str(total_invoiced)),
        total_paid=Decimal(str(total_paid)),
        total_outstanding=Decimal(str(total_outstanding)),
        total_overdue=Decimal(str(total_overdue)),
        total_expenses=Decimal(str(total_expenses)),
        total_vat_reclaimable=Decimal(str(total_vat_reclaimable)),
        upcoming_deadlines=upcoming,
        recent_invoices=recent
    )


# --- Invoices ---

@router.get("/invoices", response_model=list[InvoiceListResponse])
async def list_invoices(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("finance.view"))
):
    """List all invoices."""
    query = db.query(Invoice)
    if status:
        query = query.filter(Invoice.status == status)
    return query.order_by(Invoice.date.desc()).all()


@router.post("/invoices", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    request: Request,
    data: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("finance.invoices.create"))
):
    """Create a new invoice."""
    # Check for duplicate number
    existing = db.query(Invoice).filter(Invoice.number == data.number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invoice number already exists",
        )

    invoice = Invoice(
        number=data.number,
        date=data.date,
        due_date=data.due_date,
        client_name=data.client_name,
        client_kvk=data.client_kvk,
        client_vat=data.client_vat,
        client_address=data.client_address,
        payment_reference=data.payment_reference,
        iban=data.iban,
        notes=data.notes,
        created_by=current_user.id
    )

    # Add items
    for item_data in data.items:
        item = InvoiceItem(
            description=item_data.description,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            vat_rate=item_data.vat_rate
        )
        invoice.items.append(item)

    invoice.calculate_totals()
    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    # Log action
    service = IAMService(db)
    ip, ua = get_client_info(request)
    service.log_action(
        "invoice.created",
        user=current_user,
        resource_type="invoice",
        resource_id=invoice.id,
        new_value={"number": invoice.number, "total": str(invoice.total)},
        ip_address=ip,
        user_agent=ua
    )

    return invoice


@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("finance.view"))
):
    """Get invoice by ID."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )
    return invoice


@router.put("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: int,
    request: Request,
    data: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("finance.invoices.edit"))
):
    """Update invoice."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    # Update fields
    update_data = data.model_dump(exclude_unset=True, exclude={"items"})
    for key, value in update_data.items():
        setattr(invoice, key, value)

    # Update items if provided
    if data.items is not None:
        # Clear existing items
        invoice.items.clear()
        # Add new items
        for item_data in data.items:
            item = InvoiceItem(
                description=item_data.description,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                vat_rate=item_data.vat_rate
            )
            invoice.items.append(item)
        invoice.calculate_totals()

    db.commit()
    db.refresh(invoice)

    # Log action
    service = IAMService(db)
    ip, ua = get_client_info(request)
    service.log_action(
        "invoice.updated",
        user=current_user,
        resource_type="invoice",
        resource_id=invoice.id,
        new_value=update_data,
        ip_address=ip,
        user_agent=ua
    )

    return invoice


@router.delete("/invoices/{invoice_id}")
async def delete_invoice(
    invoice_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("finance.invoices.edit"))
):
    """Delete invoice."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    invoice_number = invoice.number
    db.delete(invoice)
    db.commit()

    # Log action
    service = IAMService(db)
    ip, ua = get_client_info(request)
    service.log_action(
        "invoice.deleted",
        user=current_user,
        resource_type="invoice",
        resource_id=invoice_id,
        old_value={"number": invoice_number},
        ip_address=ip,
        user_agent=ua
    )

    return {"message": "Invoice deleted"}


# --- Expenses ---

@router.get("/expenses", response_model=list[ExpenseResponse])
async def list_expenses(
    category: str = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("finance.view"))
):
    """List all expenses."""
    query = db.query(Expense)
    if category:
        query = query.filter(Expense.category == category)
    if status:
        query = query.filter(Expense.status == status)
    return query.order_by(Expense.date.desc()).all()


@router.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    request: Request,
    data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("finance.expenses.create"))
):
    """Create a new expense."""
    if data.category not in EXPENSE_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Valid: {EXPENSE_CATEGORIES}",
        )

    expense = Expense(
        date=data.date,
        category=data.category,
        amount=data.amount,
        vat_reclaimable=data.vat_reclaimable,
        description=data.description,
        receipt_path=data.receipt_path,
        created_by=current_user.id
    )

    db.add(expense)
    db.commit()
    db.refresh(expense)

    # Log action
    service = IAMService(db)
    ip, ua = get_client_info(request)
    service.log_action(
        "expense.created",
        user=current_user,
        resource_type="expense",
        resource_id=expense.id,
        new_value={"amount": str(expense.amount), "category": expense.category},
        ip_address=ip,
        user_agent=ua
    )

    return expense


@router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: int,
    request: Request,
    data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("finance.expenses.create"))
):
    """Update expense."""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(expense, key, value)

    db.commit()
    db.refresh(expense)

    return expense


# --- Tax Deadlines ---

@router.get("/taxes/deadlines", response_model=list[TaxDeadlineResponse])
async def list_tax_deadlines(
    year: int = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("finance.view"))
):
    """List tax deadlines."""
    # Seed current year if needed
    current_year = date.today().year
    seed_tax_deadlines(db, current_year)
    check_overdue_deadlines(db)

    query = db.query(TaxDeadline)
    if year:
        query = query.filter(TaxDeadline.year == year)
    if status:
        query = query.filter(TaxDeadline.status == status)

    return query.order_by(TaxDeadline.due_date).all()


@router.put("/taxes/deadlines/{deadline_id}", response_model=TaxDeadlineResponse)
async def update_tax_deadline(
    deadline_id: int,
    request: Request,
    data: TaxDeadlineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("finance.taxes.manage"))
):
    """Update tax deadline status."""
    deadline = db.query(TaxDeadline).filter(TaxDeadline.id == deadline_id).first()
    if not deadline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tax deadline not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(deadline, key, value)

    db.commit()
    db.refresh(deadline)

    # Log action
    service = IAMService(db)
    ip, ua = get_client_info(request)
    service.log_action(
        "tax_deadline.updated",
        user=current_user,
        resource_type="tax_deadline",
        resource_id=deadline.id,
        new_value=update_data,
        ip_address=ip,
        user_agent=ua
    )

    return deadline


@router.get("/taxes/vat-summary", response_model=VATSummary)
async def get_vat_summary(
    year: int = None,
    quarter: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("finance.view"))
):
    """Get VAT summary for a period."""
    if year is None:
        year = date.today().year

    # Calculate VAT collected from invoices
    invoice_query = db.query(Invoice).filter(
        func.extract("year", Invoice.date) == year
    )
    if quarter:
        start_month = (quarter - 1) * 3 + 1
        end_month = quarter * 3
        invoice_query = invoice_query.filter(
            func.extract("month", Invoice.date) >= start_month,
            func.extract("month", Invoice.date) <= end_month
        )
    invoices = invoice_query.all()
    vat_collected = sum(i.vat_amount or 0 for i in invoices)

    # Calculate VAT paid from expenses
    expense_query = db.query(Expense).filter(
        func.extract("year", Expense.date) == year
    )
    if quarter:
        expense_query = expense_query.filter(
            func.extract("month", Expense.date) >= start_month,
            func.extract("month", Expense.date) <= end_month
        )
    expenses = expense_query.all()
    vat_paid = sum(e.vat_reclaimable or 0 for e in expenses)

    period = f"{year}" if not quarter else f"{year} Q{quarter}"

    return VATSummary(
        period=period,
        vat_collected=Decimal(str(vat_collected)),
        vat_paid=Decimal(str(vat_paid)),
        vat_balance=Decimal(str(vat_collected - vat_paid))
    )
