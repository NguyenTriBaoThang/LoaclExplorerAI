from enum import StrEnum


class VerificationStatus(StrEnum):
    VERIFIED = "verified"
    UNVERIFIED = "unverified"
    SIMULATED = "simulated"


class SlotStatus(StrEnum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
    TENTATIVE = "tentative"
    CANCELLED = "cancelled"


class DataMode(StrEnum):
    REAL = "real"
    SIMULATED = "simulated"
    REPLAY = "replay"


class ItineraryStatus(StrEnum):
    DRAFT = "draft"
    FEASIBLE = "feasible"
    TENTATIVE = "tentative"
    ACCEPTED = "accepted"
    INVALIDATED = "invalidated"


class PriceBasis(StrEnum):
    PER_PERSON = "per_person"
    PER_GROUP = "per_group"


def enum_values(enum_type: type[StrEnum]) -> list[str]:
    return [member.value for member in enum_type]
