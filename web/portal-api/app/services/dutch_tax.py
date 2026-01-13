"""Dutch tax deadline calculator and utilities."""
from datetime import date, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from ..models.tax_deadline import TaxDeadline, TAX_DEADLINE_TYPES


def get_vat_deadline(year: int, quarter: int) -> date:
    """
    Get Dutch VAT deadline for a quarter.

    VAT is due by the last day of the month after the quarter ends.
    Q1 (Jan-Mar) → April 30
    Q2 (Apr-Jun) → July 31
    Q3 (Jul-Sep) → October 31
    Q4 (Oct-Dec) → January 31 (next year)
    """
    if quarter == 1:
        return date(year, 4, 30)
    elif quarter == 2:
        return date(year, 7, 31)
    elif quarter == 3:
        return date(year, 10, 31)
    elif quarter == 4:
        return date(year + 1, 1, 31)
    else:
        raise ValueError(f"Invalid quarter: {quarter}")


def get_corporate_tax_deadline(year: int, extended: bool = False) -> date:
    """
    Get Dutch corporate tax deadline.

    Base deadline: June 1 after fiscal year
    With extension: November 1 (5 months extra)
    """
    base = date(year + 1, 6, 1)
    if extended:
        return date(year + 1, 11, 1)
    return base


def get_annual_accounts_deadline(year: int) -> date:
    """
    Get Dutch annual accounts (KvK) deadline.

    Accounts must be filed within 12 months of year-end.
    For calendar year: December 31 of next year.

    Typical timeline for calendar-year company:
    - Management prepares by May 31
    - Shareholders may extend 5 months to October 31
    - Filing within 8 days of adoption, max December 31
    """
    return date(year + 1, 12, 31)


def seed_tax_deadlines(db: Session, year: int):
    """Seed tax deadlines for a given year."""
    deadlines = [
        ("vat_q1", get_vat_deadline(year, 1)),
        ("vat_q2", get_vat_deadline(year, 2)),
        ("vat_q3", get_vat_deadline(year, 3)),
        ("vat_q4", get_vat_deadline(year, 4)),
        ("corporate", get_corporate_tax_deadline(year)),
        ("annual_accounts", get_annual_accounts_deadline(year)),
    ]

    for dtype, due_date in deadlines:
        existing = db.query(TaxDeadline).filter(
            TaxDeadline.type == dtype,
            TaxDeadline.year == year
        ).first()

        if not existing:
            deadline = TaxDeadline(
                type=dtype,
                year=year,
                due_date=due_date,
                status="pending"
            )
            db.add(deadline)

    db.commit()


def check_overdue_deadlines(db: Session):
    """Update status of overdue deadlines."""
    today = date.today()
    db.query(TaxDeadline).filter(
        TaxDeadline.status == "pending",
        TaxDeadline.due_date < today
    ).update({"status": "overdue"})
    db.commit()


class DutchTaxRates:
    """Dutch tax rates (2024)."""

    # Corporate tax (Vennootschapsbelasting)
    CORPORATE_LOW = 0.19  # 19% on first €200,000
    CORPORATE_HIGH = 0.258  # 25.8% above €200,000
    CORPORATE_THRESHOLD = 200_000

    # VAT rates
    VAT_STANDARD = 0.21  # 21%
    VAT_REDUCED = 0.09  # 9%
    VAT_ZERO = 0.0  # 0%

    # Innovation Box (R&D)
    INNOVATION_BOX = 0.09  # 9% on qualifying profits

    # KOR threshold (small business exemption)
    KOR_THRESHOLD = 20_000  # €20,000 annual turnover

    @classmethod
    def calculate_corporate_tax(cls, profit: float) -> float:
        """Calculate corporate tax based on profit."""
        if profit <= 0:
            return 0

        if profit <= cls.CORPORATE_THRESHOLD:
            return profit * cls.CORPORATE_LOW
        else:
            low_portion = cls.CORPORATE_THRESHOLD * cls.CORPORATE_LOW
            high_portion = (profit - cls.CORPORATE_THRESHOLD) * cls.CORPORATE_HIGH
            return low_portion + high_portion

    @classmethod
    def is_kor_eligible(cls, annual_turnover: float) -> bool:
        """Check if eligible for KOR (small business VAT exemption)."""
        return annual_turnover < cls.KOR_THRESHOLD
