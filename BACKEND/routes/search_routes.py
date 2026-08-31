from fastapi import APIRouter, Query
from services.donor_service import search_donors

router = APIRouter(
    prefix="/search",
    tags=["Blood Search"]
)


@router.get("/blood")
def search_blood(
    blood_group: str = Query(...),
    city: str = Query(None)
):

    donors = search_donors(
        blood_group=blood_group,
        city=city
    )

    return {
        "blood_group": blood_group,
        "city": city,
        "count": len(donors),
        "available_donors": donors
    }