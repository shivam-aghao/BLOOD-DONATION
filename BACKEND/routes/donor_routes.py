from fastapi import APIRouter
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


@router.post("/")
def register_donor(donor: DonorCreate):

    new_donor = add_donor(donor)

    return {
        "message": "Donor registered successfully",
        "donor": new_donor
    }


@router.get("/")
def get_all_donors():

    donors = get_donors()

    return {
        "count": len(donors),
        "donors": donors
    }


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
        return {
            "message": "Donor not found"
        }

    return {
        "message": "Donor updated successfully",
        "donor": updated_donor
    }


@router.delete("/{donor_id}")
def remove_donor(donor_id: int):

    deleted_donor = delete_donor(donor_id)

    if deleted_donor is None:
        return {
            "message": "Donor not found"
        }

    return {
        "message": "Donor deleted successfully",
        "donor": deleted_donor
    }