from fastapi import APIRouter, HTTPException

from schemas.sos_schema import (
    SOSRequest,
    SOSStatusUpdate
)

from services.sos_service import (
    create_sos_request,
    get_sos_request,
    update_sos_status,
    find_matching_blood_groups
)


router = APIRouter(
    prefix="/sos",
    tags=["SOS"]
)


@router.post("/")
def create_request(request: SOSRequest):

    return create_sos_request(
        request.model_dump()
    )


@router.get("/{request_id}")
def get_request(request_id: int):

    return get_sos_request(request_id)


@router.get("/compatible/{blood_group}")
def compatible_groups(blood_group: str):

    try:
        return {
            "blood_group": blood_group,
            "compatible_groups":
                find_matching_blood_groups(blood_group)
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.put("/{request_id}/status")
def change_status(
    request_id: int,
    data: SOSStatusUpdate
):

    request = {
        "request_id": request_id
    }

    try:

        return update_sos_status(
            request,
            data.status
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )