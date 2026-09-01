from pydantic import BaseModel, Field


class InventoryUpdate(BaseModel):
    hospital_id: int = Field(
        ...,
        description="Hospital ID"
    )

    blood_group: str = Field(
        ...,
        description="Blood group e.g. A+, O-, B+"
    )

    units: int = Field(
        ...,
        ge=0,
        description="Available blood units"
    )


class InventoryCreate(BaseModel):
    hospital_id: int = Field(
        ...,
        description="Hospital ID"
    )

    blood_group: str = Field(
        ...,
        description="Blood group e.g. A+, O-, B+"
    )

    units: int = Field(
        ...,
        ge=0,
        description="Available blood units"
    )