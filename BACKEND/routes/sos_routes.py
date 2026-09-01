from fastapi import APIRouter, HTTPException

from schemas.sos_schema import (
    SOSRequest,
    SOSStatusUpdate
)

from services.sos_service import (
    create_sos,
    get_sos_requests,
    get_sos,
    update_sos_status
)


router = APIRouter(
    prefix="/sos",
    tags=["SOS Requests"]
)


@router.post("/")
def create_sos_request(data: SOSRequest):
    return create_sos(
        data.model_dump()
    )


@router.get("/")
def list_sos_requests():
    return get_sos_requests()


@router.get("/{sos_id}")
def get_sos_request(sos_id: int):
    try:
        return get_sos(sos_id)

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


@router.put("/{sos_id}/status")
def change_sos_status(
    sos_id: int,
    data: SOSStatusUpdate
):
    try:
        return update_sos_status(
            sos_id,
            data.status
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
