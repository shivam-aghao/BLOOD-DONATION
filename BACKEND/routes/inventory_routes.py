from fastapi import APIRouter, HTTPException

from schemas.inventory_schema import (
    InventoryUpdate
)

from services.inventory_service import (
    get_inventory,
    get_stock,
    update_inventory
)


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


@router.get("/{hospital_id}")
def hospital_inventory(hospital_id: int):
    return get_inventory(hospital_id)


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
