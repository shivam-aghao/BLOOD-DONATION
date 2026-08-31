from fastapi import APIRouter, HTTPException

from schemas.hospital_schema import (
    HospitalCreate,
    HospitalUpdate
)

from services.hospital_service import (
    get_hospitals,
    get_hospital,
    create_hospital,
    update_hospital
)


router = APIRouter(
    prefix="/hospitals",
    tags=["Hospitals"]
)


@router.get("/")
def list_hospitals():
    return get_hospitals()


@router.get("/{hospital_id}")
def get_hospital_details(hospital_id: int):
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
    hospital_id: int,
    data: HospitalUpdate
):
    try:
        return update_hospital(
            hospital_id,
            data.model_dump()
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )