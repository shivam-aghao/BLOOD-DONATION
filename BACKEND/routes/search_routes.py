from fastapi import APIRouter, Query, HTTPException
from services.donor_service import search_donors

router = APIRouter(
    prefix="/search",
    tags=["Blood Search"]
)


BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-"
]


@router.get("/blood")
def search_blood(
    blood_group: str = Query(...),
    city: str = Query(None)
):
    # Handle URL unencoded '+' which gets parsed as space (e.g. 'A ' -> 'A+')
    normalized_group = blood_group.strip()
    if blood_group.endswith(" ") or (len(normalized_group) <= 2 and not normalized_group.endswith(("-", "+"))):
        normalized_group = normalized_group + "+"

    if blood_group not in BLOOD_GROUPS:
        raise HTTPException(
            status_code=400,
            detail="Invalid blood group"
        )

    donors = search_donors(
        blood_group=normalized_group,
        city=city
    )

    return {
        "blood_group": normalized_group,
        "city": city,
        "count": len(donors),
        "available_donors": donors
    }