from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase
from routes.hospital_routes import DEFAULT_HOSPITALS

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)

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

