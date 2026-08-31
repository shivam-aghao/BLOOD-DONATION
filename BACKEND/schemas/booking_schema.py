from pydantic import BaseModel, Field


class BookingRequest(BaseModel):
    hospital_id: int
    blood_group: str
    patient_name: str
    units: int = Field(ge=1)
    doctor_name: str | None = None
    contact: str
    notes: str | None = None


class BookingStatusUpdate(BaseModel):
    status: str