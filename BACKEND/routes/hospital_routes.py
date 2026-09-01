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
    delete_hospital
)

router = APIRouter(
    prefix="/hospitals",
    tags=["Hospitals"]
)


# =========================
# GET ALL HOSPITALS
# =========================
@router.get("/")
def list_hospitals():
    return get_hospitals()


# =========================
# GET SINGLE HOSPITAL
# =========================
@router.get("/{hospital_id}")
def get_hospital_details(hospital_id: int):

    try:
        hospital = get_hospital(hospital_id)

        return hospital

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
