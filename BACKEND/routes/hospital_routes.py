from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from schemas.hospital_schema import (
    HospitalCreate,
    HospitalUpdate
)

from services.hospital_service import (
    get_hospitals,
    get_hospital,
    create_hospital,
    update_hospital,
    hospitals
)

router = APIRouter(
    prefix="/hospitals",
    tags=["Hospitals"]
)


class InventoryPayload(BaseModel):
    inventory: Dict[str, int]


@router.get("/")
def list_hospitals():
    return get_hospitals()


@router.get("/{hospital_id}")
def get_hospital_details(hospital_id: str):
    try:
        return get_hospital(hospital_id)
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


@router.post("/")
def register_hospital(data: HospitalCreate):
    return create_hospital(
        data.model_dump()
    )


@router.put("/{hospital_id}")
def update_hospital_details(
    hospital_id: str,
    data: HospitalUpdate
):
    try:
        return update_hospital(
            hospital_id,
            data.model_dump(exclude_unset=True)
        )
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


@router.put("/{hospital_id}/inventory")
def update_inventory(hospital_id: str, payload: InventoryPayload):
    try:
        h = get_hospital(hospital_id)
        h["inventory"] = payload.inventory
        return {"message": "Inventory updated successfully", "inventory": h["inventory"]}
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))
