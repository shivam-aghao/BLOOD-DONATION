
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


# =========================
# CREATE SOS REQUEST
# =========================
@router.post("/")
def create_sos_request(
    data: SOSRequest
):
    sos = create_sos(
        data.model_dump()
    )

    if sos is None:
        raise HTTPException(
            status_code=500,
            detail="Failed to create SOS request"
        )

    return {
        "message": "SOS request created successfully",
        "sos": sos
    }


# =========================
# GET ALL SOS REQUESTS
# =========================
@router.get("/")
def list_sos_requests():

    sos_requests = get_sos_requests()

    return {
        "count": len(sos_requests),
        "sos_requests": sos_requests
    }


# =========================
# GET SINGLE SOS REQUEST
# =========================
@router.get("/{sos_id}")
def get_sos_request(
    sos_id: int
):

    sos = get_sos(sos_id)

    if sos is None:
        raise HTTPException(
            status_code=404,
            detail="SOS request not found"
        )

    return sos


# =========================
# UPDATE SOS STATUS
# =========================
@router.put("/{sos_id}/status")
def change_sos_status(
    sos_id: int,
    data: SOSStatusUpdate
):

    try:

        sos = update_sos_status(
            sos_id,
            data.status
        )

        if sos is None:
            raise HTTPException(
                status_code=404,
                detail="SOS request not found"
            )

        return {
            "message": "SOS status updated successfully",
            "sos": sos
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
