from pydantic import BaseModel, Field


class SOSRequest(BaseModel):
    patient_name: str
    blood_group: str
    units: int = Field(ge=1)
    urgency: str
    hospital: str
    city: str
    contact_name: str
    contact_phone: str
    notes: str | None = None


class SOSStatusUpdate(BaseModel):
    status: str