"""CIF & Credit Limits (Agent 2).

Limits are never stored as a mutable "used" counter. Utilisation is read in real
time from the ledger's LOAN_PRINCIPAL buckets of every contract under a facility:

    REVOLVING      available = approved_limit - outstanding principal
    NON_REVOLVING  available = approved_limit - cumulative drawdowns (sum of Dr)
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal
from enum import Enum

from .core_ledger import ImmutableLedgerEngine


class KycStatus(str, Enum):
    ACTIVE = "ACTIVE"
    FROZEN = "FROZEN"
    CLOSED = "CLOSED"


class FacilityType(str, Enum):
    REVOLVING = "REVOLVING"
    NON_REVOLVING = "NON_REVOLVING"


class LimitError(Exception):
    """Base error for drawdown validation failures."""


class KycNotActiveError(LimitError):
    pass


class FacilityExpiredError(LimitError):
    pass


class LimitExceededError(LimitError):
    pass


@dataclass(frozen=True)
class CustomerCIF:
    cif_id: str
    name: str
    kyc_status: KycStatus
    risk_grade: str


@dataclass(frozen=True)
class CreditFacility:
    facility_id: str
    cif_id: str
    facility_type: FacilityType
    approved_limit: Decimal
    expiry_date: date

    def __post_init__(self) -> None:
        if not isinstance(self.approved_limit, Decimal) or self.approved_limit <= 0:
            raise ValueError("approved_limit must be a positive Decimal")


@dataclass
class LimitControlService:
    ledger: ImmutableLedgerEngine
    _customers: dict[str, CustomerCIF] = field(default_factory=dict)
    _facilities: dict[str, CreditFacility] = field(default_factory=dict)
    _principal_accounts: dict[str, list[str]] = field(default_factory=dict)

    # -- registry ---------------------------------------------------------
    def register_customer(self, cif: CustomerCIF) -> None:
        self._customers[cif.cif_id] = cif

    def update_customer(self, cif: CustomerCIF) -> None:
        """Replace the CIF record (e.g. KYC freeze). Records are immutable values."""
        if cif.cif_id not in self._customers:
            raise KeyError(cif.cif_id)
        self._customers[cif.cif_id] = cif

    def register_facility(self, facility: CreditFacility) -> None:
        if facility.cif_id not in self._customers:
            raise KeyError(f"Unknown CIF {facility.cif_id}")
        self._facilities[facility.facility_id] = facility
        self._principal_accounts.setdefault(facility.facility_id, [])

    def link_principal_account(self, facility_id: str, account_id: str) -> None:
        accounts = self._principal_accounts[facility_id]
        if account_id not in accounts:
            accounts.append(account_id)

    def get_facility(self, facility_id: str) -> CreditFacility:
        return self._facilities[facility_id]

    def get_customer(self, cif_id: str) -> CustomerCIF:
        return self._customers[cif_id]

    # -- limits -----------------------------------------------------------
    def get_outstanding_principal(self, facility_id: str, as_of: date | None = None) -> Decimal:
        return sum(
            (self.ledger.get_balance(a, as_of) for a in self._principal_accounts[facility_id]),
            Decimal("0"),
        )

    def get_cumulative_drawn(self, facility_id: str, as_of: date | None = None) -> Decimal:
        return sum(
            (self.ledger.get_total_debits(a, as_of) for a in self._principal_accounts[facility_id]),
            Decimal("0"),
        )

    def get_available_limit(self, facility_id: str, current_date: date) -> Decimal:
        facility = self._facilities[facility_id]
        if facility.facility_type is FacilityType.REVOLVING:
            used = self.get_outstanding_principal(facility_id, current_date)
        else:
            used = self.get_cumulative_drawn(facility_id, current_date)
        return max(facility.approved_limit - used, Decimal("0"))

    def validate_drawdown(self, facility_id: str, amount: Decimal, current_date: date) -> None:
        """Raise a ``LimitError`` subclass if the drawdown must be rejected."""
        if not isinstance(amount, Decimal) or amount <= 0:
            raise LimitError("Drawdown amount must be a positive Decimal")
        facility = self._facilities[facility_id]
        cif = self._customers[facility.cif_id]
        if cif.kyc_status is not KycStatus.ACTIVE:
            raise KycNotActiveError(f"CIF {cif.cif_id} KYC is {cif.kyc_status.value}")
        if current_date > facility.expiry_date:
            raise FacilityExpiredError(f"Facility {facility_id} expired {facility.expiry_date}")
        available = self.get_available_limit(facility_id, current_date)
        if amount > available:
            raise LimitExceededError(f"Requested {amount} > available {available}")
