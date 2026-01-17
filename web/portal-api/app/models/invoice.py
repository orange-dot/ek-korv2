"""Invoice and InvoiceItem models."""
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from ..database import Base


class Invoice(Base):
    """Invoice model (NLCIUS compliant)."""
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String(50), unique=True, nullable=False, index=True)
    date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)

    # Client info
    client_name = Column(String(255), nullable=False)
    client_kvk = Column(String(20), nullable=True)  # Dutch KvK number
    client_vat = Column(String(50), nullable=True)  # VAT number
    client_address = Column(Text, nullable=True)

    # Amounts
    subtotal = Column(Numeric(10, 2), default=0)
    vat_amount = Column(Numeric(10, 2), default=0)
    total = Column(Numeric(10, 2), default=0)

    # Status
    status = Column(String(20), default="draft")  # draft, sent, paid, overdue

    # Payment info (NLCIUS requirements)
    payment_reference = Column(String(100), nullable=True)
    iban = Column(String(50), nullable=True)

    notes = Column(Text, nullable=True)

    # Audit
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")

    def calculate_totals(self):
        """Calculate subtotal, VAT, and total from items."""
        subtotal = Decimal("0")
        vat_amount = Decimal("0")

        for item in self.items:
            item_total = Decimal(str(item.quantity)) * Decimal(str(item.unit_price))
            item_vat = item_total * Decimal(str(item.vat_rate)) / Decimal("100")
            subtotal += item_total
            vat_amount += item_vat

        self.subtotal = subtotal
        self.vat_amount = vat_amount
        self.total = subtotal + vat_amount


class InvoiceItem(Base):
    """Invoice line item."""
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    description = Column(String(500), nullable=False)
    quantity = Column(Numeric(10, 2), default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    vat_rate = Column(Integer, default=21)  # 21%, 9%, or 0%

    # Relationships
    invoice = relationship("Invoice", back_populates="items")

    @property
    def line_total(self) -> Decimal:
        """Calculate line total (excl. VAT)."""
        return Decimal(str(self.quantity)) * Decimal(str(self.unit_price))

    @property
    def line_vat(self) -> Decimal:
        """Calculate line VAT amount."""
        return self.line_total * Decimal(str(self.vat_rate)) / Decimal("100")
