from fastapi import APIRouter, HTTPException

from schemas.donor_schema import DonorCreate

from services.donor_service import (
    add_donor,
    get_donors,
    update_donor,
    delete_donor
)


router = APIRouter(
    prefix="/donors",
    tags=["Donors"]
)


# =========================
# REGISTER DONOR
# =========================
@router.post("/")
def register_donor(donor: DonorCreate):

    new_donor = add_donor(donor)

    if new_donor is None:
        raise HTTPException(
            status_code=500,
            detail="Failed to register donor"
        )

    return {
        "message": "Donor registered successfully",
        "donor": new_donor
    }


# =========================
# GET ALL DONORS
# =========================
@router.get("/")
def get_all_donors():

    donors = get_donors()

    return {
        "count": len(donors),
        "donors": donors
    }


# =========================
# UPDATE DONOR
# =========================
@router.put("/{donor_id}")
def update_donor_details(
    donor_id: int,
    donor: DonorCreate
):

    updated_donor = update_donor(
        donor_id,
        donor
    )

    if updated_donor is None:
        raise HTTPException(
            status_code=404,
            detail="Donor not found"
        )

    return {
        "message": "Donor updated successfully",
        "donor": updated_donor
    }


# =========================
# DELETE DONOR
# =========================
@router.delete("/{donor_id}")
def remove_donor(donor_id: int):

    deleted_donor = delete_donor(donor_id)

    if deleted_donor is None:
        raise HTTPException(
            status_code=404,
            detail="Donor not found"
        )

    return {
        "message": "Donor deleted successfully",
        "donor": deleted_donor
    }