from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from database import supabase

router = APIRouter(
    prefix="/hospitals",
    tags=["Hospitals"]
)

DEFAULT_HOSPITALS = [
    {
        "hospital_id": "hosp-1",
        "id": "hosp-1",
        "hospital_name": "City General Hospital & Trauma Center",
        "name": "City General Hospital & Trauma Center",
        "city": "AKOLA",
        "address": "420 East 70th Street, Manhattan",
        "contact_number": "+1 (212) 555-0199",
        "contact": "+1 (212) 555-0199",
        "email": "bloodbank@citygeneral.org",
        "operating_hours": "24/7 Emergency Blood Bank",
        "inventory": {
            "A+": 14, "A-": 4, "B+": 9, "B-": 2,
            "AB+": 6, "AB-": 3, "O+": 22, "O-": 5
        }
    },
    {
        "hospital_id": "hosp-2",
        "id": "hosp-2",
        "hospital_name": "St. Mary's Regional Blood Center",
        "name": "St. Mary's Regional Blood Center",
        "city": "AKOLA",
        "address": "1300 York Avenue, Manhattan",
        "contact_number": "+1 (212) 555-0234",
        "contact": "+1 (212) 555-0234",
        "email": "donations@stmarysblood.org",
        "operating_hours": "24/7 Emergency Service",
        "inventory": {
            "A+": 8, "A-": 0, "B+": 12, "B-": 1,
            "AB+": 4, "AB-": 0, "O+": 18, "O-": 2
        }
    },
    {
        "hospital_id": "hosp-3",
        "id": "hosp-3",
        "hospital_name": "Brooklyn Central Medical Center",
        "name": "Brooklyn Central Medical Center",
        "city": "Brooklyn",
        "address": "506 6th Street, Brooklyn",
        "contact_number": "+1 (718) 555-0456",
        "contact": "+1 (718) 555-0456",
        "email": "bloodservice@brooklynmed.org",
        "operating_hours": "Mon - Sun: 24 Hours",
        "inventory": {
            "A+": 11, "A-": 3, "B+": 5, "B-": 0,
            "AB+": 7, "AB-": 2, "O+": 15, "O-": 4
        }
    }
]

class HospitalCreate(BaseModel):
    hospital_name: str
    city: str
    address: str
    contact_number: str
    email: str
    operating_hours: Optional[str] = "24/7 Emergency Blood Bank"

class HospitalUpdate(BaseModel):
    hospital_name: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    operating_hours: Optional[str] = None

class InventoryUpdatePayload(BaseModel):
    inventory: Dict[str, int]

@router.get("/")
def list_hospitals(city: Optional[str] = None):
    try:
        query = supabase.table("hospitals").select("*")
        if city and city.lower() != "all":
            query = query.ilike("city", f"%{city}%")
        res = query.execute()
        if res.data and len(res.data) > 0:
            return {"count": len(res.data), "hospitals": res.data}
    except Exception:
        pass

    filtered = DEFAULT_HOSPITALS
    if city and city.lower() != "all":
        filtered = [h for h in DEFAULT_HOSPITALS if city.lower() in h["city"].lower()]
    return {"count": len(filtered), "hospitals": filtered}

@router.get("/{hospital_id}")
def get_hospital(hospital_id: str):
    for h in DEFAULT_HOSPITALS:
        if h["hospital_id"] == hospital_id or h.get("id") == hospital_id:
            return h
    raise HTTPException(status_code=404, detail="Hospital not found")

@router.post("/")
def create_hospital(hosp: HospitalCreate):
    new_h = hosp.model_dump()
    new_id = f"hosp-{len(DEFAULT_HOSPITALS) + 1}"
    new_h["hospital_id"] = new_id
    new_h["id"] = new_id
    new_h["name"] = new_h["hospital_name"]
    new_h["contact"] = new_h["contact_number"]
    new_h["inventory"] = {
        "A+": 5, "A-": 5, "B+": 5, "B-": 5,
        "AB+": 5, "AB-": 5, "O+": 5, "O-": 5
    }
    
    try:
        supabase.table("hospitals").insert({
            "hospital_name": hosp.hospital_name,
            "city": hosp.city,
            "address": hosp.address,
            "contact_number": hosp.contact_number,
            "email": hosp.email
        }).execute()
    except Exception:
        pass

    DEFAULT_HOSPITALS.append(new_h)
    return {"message": "Hospital registered successfully", "hospital": new_h}

@router.put("/{hospital_id}")
def update_hospital(hospital_id: str, data: HospitalUpdate):
    h = next((item for item in DEFAULT_HOSPITALS if item["hospital_id"] == hospital_id or item.get("id") == hospital_id), None)
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    updates = data.model_dump(exclude_unset=True)
    h.update(updates)
    if "hospital_name" in updates:
        h["name"] = updates["hospital_name"]
    if "contact_number" in updates:
        h["contact"] = updates["contact_number"]
    if "operating_hours" in updates:
        h["operatingHours"] = updates["operating_hours"]

    try:
        supabase.table("hospitals").update(updates).eq("hospital_id", hospital_id).execute()
    except Exception:
        pass

    return {"message": "Hospital updated successfully", "hospital": h}

@router.put("/{hospital_id}/inventory")
def update_hospital_inventory(hospital_id: str, payload: InventoryUpdatePayload):
    h = next((item for item in DEFAULT_HOSPITALS if item["hospital_id"] == hospital_id or item.get("id") == hospital_id), None)
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    h["inventory"] = payload.inventory
    return {"message": "Inventory updated successfully", "inventory": h["inventory"]}

@router.delete("/{hospital_id}")
def delete_hospital(hospital_id: str):
    global DEFAULT_HOSPITALS
    existing = next((item for item in DEFAULT_HOSPITALS if item["hospital_id"] == hospital_id or item.get("id") == hospital_id), None)
    if not existing:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    DEFAULT_HOSPITALS = [item for item in DEFAULT_HOSPITALS if item["hospital_id"] != hospital_id and item.get("id") != hospital_id]
    
    try:
        supabase.table("hospitals").delete().eq("hospital_id", hospital_id).execute()
    except Exception:
        pass

    return {"message": "Hospital deleted successfully", "hospital": existing}
