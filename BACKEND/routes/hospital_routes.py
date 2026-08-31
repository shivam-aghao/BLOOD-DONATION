from fastapi import APIRouter, HTTPException

from schemas.hospital_schema import HospitalCreate, HospitalUpdate
from services.hospital_service import (
    add_hospital,
    get_hospital,
    update_hospital,
    get_all_hospitals
)


router = APIRouter(
    prefix="/hospitals",
    tags=["Hospitals"]
)


@router.post("/")
def create_hospital(hospital: HospitalCreate):

    return add_hospital(hospital.model_dump())


@router.get("/")
def hospitals():

    return get_all_hospitals()


@router.get("/{hospital_id}")
def hospital(hospital_id: int):

    return get_hospital(hospital_id)


@router.put("/{hospital_id}")
def edit_hospital(
    hospital_id: int,
    hospital: HospitalUpdate
):

    return update_hospital(
        hospital_id,
        hospital.model_dump()
    )