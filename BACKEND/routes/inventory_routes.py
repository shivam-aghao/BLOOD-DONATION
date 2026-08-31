from fastapi import APIRouter, HTTPException

from schemas.inventory_schema import (
    InventoryUpdate,
    RestockRequest
)

from services.inventory_service import (
    update_stock,
    restock_all,
    get_total_stock
)


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


@router.put("/update")
def update_inventory(data: InventoryUpdate):

    inventory = {
        data.blood_group: data.units
    }

    try:
        return update_stock(
            inventory,
            data.blood_group,
            data.units
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.post("/restock")
def restock_inventory(data: RestockRequest):

    inventory = {
        "A+": 0,
        "A-": 0,
        "B+": 0,
        "B-": 0,
        "AB+": 0,
        "AB-": 0,
        "O+": 0,
        "O-": 0
    }

    return restock_all(
        inventory,
        data.amount
    )


@router.post("/total")
def total_inventory(inventory: dict):

    return {
        "total_stock": get_total_stock(inventory)
    }