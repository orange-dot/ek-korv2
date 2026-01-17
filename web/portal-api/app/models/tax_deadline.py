"""Tax deadline model."""
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Boolean
from ..database import Base


class TaxDeadline(Base):
    """Tax deadline tracking."""
    __tablename__ = "tax_deadlines"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)  # vat_q1, vat_q2, vat_q3, vat_q4, corporate, annual_accounts
    year = Column(Integer, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String(20), default="pending")  # pending, filed, overdue
    extension_requested = Column(Boolean, default=False)
    filed_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)


# Dutch tax deadline types
TAX_DEADLINE_TYPES = {
    "vat_q1": "VAT Q1 (Jan-Mar)",
    "vat_q2": "VAT Q2 (Apr-Jun)",
    "vat_q3": "VAT Q3 (Jul-Sep)",
    "vat_q4": "VAT Q4 (Oct-Dec)",
    "corporate": "Corporate Tax (Vennootschapsbelasting)",
    "annual_accounts": "Annual Accounts (KvK)",
}
