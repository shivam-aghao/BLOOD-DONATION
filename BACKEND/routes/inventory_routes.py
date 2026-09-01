from fastapi import APIRouter, HTTPException

from schemas.inventory_schema import (
    InventoryUpdate
)

from services.inventory_service import (
    get_inventory,
    get_stock,
    update_inventory,
    add_stock,
    remove_stock
)


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


# =========================
# GET HOSPITAL INVENTORY
# =========================
@router.get("/{hospital_id}")
def hospital_inventory(hospital_id: int):

    return get_inventory(hospital_id)


# =========================
# GET SPECIFIC BLOOD STOCK
# =========================
@router.get("/{hospital_id}/{blood_group}")
def blood_stock(
    hospital_id: int,
    blood_group: str
):

    try:

        return get_stock(
            hospital_id,
            blood_group
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


# =========================
# UPDATE INVENTORY
# =========================
@router.put("/")
def update_blood_inventory(
    data: InventoryUpdate
):

    try:

        return update_inventory(
            data.hospital_id,
            data.blood_group,
            data.units
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# =========================
# ADD BLOOD STOCK
# =========================
@router.post("/add")
def add_blood_stock(
    data: InventoryUpdate
):

    try:

        return add_stock(
            data.hospital_id,
            data.blood_group,
            data.units
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# =========================
# REMOVE BLOOD STOCK
# =========================
@router.post("/remove")
def remove_blood_stock(
    data: InventoryUpdate
):

    try:

        return remove_stock(
            data.hospital_id,
            data.blood_group,
            data.units
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
