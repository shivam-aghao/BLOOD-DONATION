from fastapi import APIRouter, HTTPException
<<<<<<< HEAD
from pydantic import BaseModel
from typing import Optional
from database import supabase
from routes.hospital_routes import DEFAULT_HOSPITALS
=======

from schemas.inventory_schema import (
    InventoryUpdate
)

from services.inventory_service import (
    get_inventory,
    get_stock,
    update_inventory
)

>>>>>>> 193549310bf7b111bdc914f63a0f3746d4dd73fb

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)

<<<<<<< HEAD
class InventoryUpdate(BaseModel):
    hospital_id: str
    blood_group: str
    units: int

@router.get("/")
def get_inventory(hospital_id: Optional[str] = None):
    # Try querying Supabase blood_inventory
    try:
        query = supabase.table("blood_inventory").select("*")
        if hospital_id:
            query = query.eq("hospital_id", hospital_id)
        res = query.execute()
        if res.data and len(res.data) > 0:
            return {"count": len(res.data), "inventory": res.data}
    except Exception:
        pass

    # Local fallback
    if hospital_id:
        hosp = next((h for h in DEFAULT_HOSPITALS if h["hospital_id"] == hospital_id or h.get("id") == hospital_id), None)
        if hosp:
            return {"hospital_id": hospital_id, "inventory": hosp.get("inventory", {})}
        raise HTTPException(status_code=404, detail="Hospital not found")

    return {
        "hospitals_inventory": [
            {"hospital_id": h["hospital_id"], "hospital_name": h["hospital_name"], "inventory": h.get("inventory", {})}
            for h in DEFAULT_HOSPITALS
        ]
    }

@router.post("/update")
def update_stock(data: InventoryUpdate):
    hosp = next((h for h in DEFAULT_HOSPITALS if h["hospital_id"] == data.hospital_id or h.get("id") == data.hospital_id), None)
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")

    if "inventory" not in hosp:
        hosp["inventory"] = {}
    hosp["inventory"][data.blood_group] = max(0, data.units)

    # Try updating Supabase blood_inventory
    try:
        supabase.table("blood_inventory").upsert({
            "hospital_id": data.hospital_id,
            "blood_group": data.blood_group,
            "units_available": data.units
        }).execute()
    except Exception:
        pass

    return {
        "message": "Stock updated successfully",
        "hospital_id": data.hospital_id,
        "blood_group": data.blood_group,
        "units": hosp["inventory"][data.blood_group]
    }

=======

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
>>>>>>> 193549310bf7b111bdc914f63a0f3746d4dd73fb
