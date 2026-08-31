from pydantic import BaseModel, Field


class InventoryUpdate(BaseModel):
    hospital_id: int
    blood_group: str
    units: int = Field(ge=0)


class RestockRequest(BaseModel):
    hospital_id: int
    amount: int = Field(default=5, ge=1)