from pydantic import BaseModel, Field


class BookingRequest(BaseModel):
    hospital_id: int = Field(..., description="Hospital ID")

    blood_group: str = Field(..., description="Required blood group")

    patient_name: str = Field(..., description="Patient full name")

    units: int = Field(
        ...,
        ge=1,
        description="Number of blood units required"
    )

    doctor_name: str | None = Field(
        default=None,
        description="Doctor name or department"
    )

    contact: str = Field(
        ...,
        description="Patient/contact phone number"
    )

    notes: str | None = Field(
        default=None,
        description="Hospital case number or additional notes"
    )


class BookingStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        description="Booking status: pending, approved, rejected, fulfilled"
    )