from pydantic import BaseModel, Field


class SOSRequest(BaseModel):
    patient_name: str = Field(
        ...,
        description="Patient full name"
    )

    blood_group: str = Field(
        ...,
        description="Required blood group"
    )

    units: int = Field(
        ...,
        ge=1,
        description="Number of units needed"
    )

    urgency: str = Field(
        ...,
        description="Urgency level"
    )

    hospital: str = Field(
        ...,
        description="Hospital or facility name"
    )

    city: str = Field(
        ...,
        description="City or location"
    )

    contact_name: str = Field(
        ...,
        description="Contact person name"
    )

    contact_phone: str = Field(
        ...,
        description="Contact mobile number"
    )

    notes: str | None = Field(
        default=None,
        description="Optional medical notes"
    )


class SOSStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        description="SOS status: open, fulfilled, cancelled"
    )