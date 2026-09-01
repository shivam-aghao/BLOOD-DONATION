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
<<<<<<< Updated upstream
    hospitals
=======
    delete_hospital
>>>>>>> Stashed changes
)

router = APIRouter(
    prefix="/hospitals",
    tags=["Hospitals"]
)


<<<<<<< Updated upstream
class InventoryPayload(BaseModel):
    inventory: Dict[str, int]


=======
# =========================
# GET ALL HOSPITALS
# =========================
>>>>>>> Stashed changes
@router.get("/")
def list_hospitals():
    return get_hospitals()


# =========================
# GET SINGLE HOSPITAL
# =========================
@router.get("/{hospital_id}")
<<<<<<< Updated upstream
def get_hospital_details(hospital_id: str):
    try:
        return get_hospital(hospital_id)
=======
def get_hospital_details(hospital_id: int):

    try:
        hospital = get_hospital(hospital_id)

        return hospital

>>>>>>> Stashed changes
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


# =========================
# CREATE HOSPITAL
# =========================
@router.post("/")
def register_hospital(data: HospitalCreate):

    return create_hospital(
        data.model_dump()
    )


# =========================
# UPDATE HOSPITAL
# =========================
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


<<<<<<< Updated upstream
@router.put("/{hospital_id}/inventory")
def update_inventory(hospital_id: str, payload: InventoryPayload):
    try:
        h = get_hospital(hospital_id)
        h["inventory"] = payload.inventory
        return {"message": "Inventory updated successfully", "inventory": h["inventory"]}
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))
=======
# =========================
# DELETE HOSPITAL
# =========================
@router.delete("/{hospital_id}")
def remove_hospital(hospital_id: int):

    try:
        return delete_hospital(hospital_id)

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )
>>>>>>> Stashed changes
