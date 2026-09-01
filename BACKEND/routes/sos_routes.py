from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter(
    prefix="/sos",
    tags=["SOS Emergency Requests"]
)

SOS_STORE = [
    {
        "id": "SOS-1001",
        "sos_id": "SOS-1001",
        "patient_name": "Michael Smith",
        "blood_group": "O-",
        "units": 3,
        "urgency": "Critical (Immediate)",
        "hospital": "City General Hospital",
        "city": "AKOLA",
        "contact_name": "Dr. Katherine Adams (ICU)",
        "contact_phone": "+1 (212) 555-0199",
        "notes": "Emergency vascular trauma surgery. Immediate matching needed.",
        "status": "open",
        "created_at": datetime.now().isoformat()
    }
]

class SOSCreate(BaseModel):
    patient_name: str
    blood_group: str
    units: int
    urgency: str
    hospital: str
    city: str
    contact_name: str
    contact_phone: str
    notes: Optional[str] = None

class SOSUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

@router.get("/")
def get_all_sos(status: Optional[str] = None):
    if status and status.lower() != "all":
        return [s for s in SOS_STORE if s.get("status", "").lower() == status.lower()]
    return SOS_STORE

@router.post("/")
def create_sos(data: SOSCreate):
    new_id = f"SOS-{len(SOS_STORE) + 1001}"
    new_sos = {
        "id": new_id,
        "sos_id": new_id,
        "patient_name": data.patient_name,
        "blood_group": data.blood_group,
        "units": data.units,
        "urgency": data.urgency,
        "hospital": data.hospital,
        "city": data.city,
        "contact_name": data.contact_name,
        "contact_phone": data.contact_phone,
        "notes": data.notes,
        "status": "open",
        "created_at": datetime.now().isoformat()
    }
    SOS_STORE.insert(0, new_sos)
    return {"message": "SOS request created successfully", "sos": new_sos}

@router.put("/{sos_id}")
def update_sos(sos_id: str, data: SOSUpdate):
    sos = next((s for s in SOS_STORE if s["id"] == sos_id or s.get("sos_id") == sos_id), None)
    if not sos:
        raise HTTPException(status_code=404, detail="SOS request not found")
    if data.status is not None:
        sos["status"] = data.status
    if data.notes is not None:
        sos["notes"] = data.notes
    return {"message": "SOS request updated", "sos": sos}

@router.delete("/{sos_id}")
def delete_sos(sos_id: str):
    global SOS_STORE
    existing = next((s for s in SOS_STORE if s["id"] == sos_id or s.get("sos_id") == sos_id), None)
    if not existing:
        raise HTTPException(status_code=404, detail="SOS request not found")
    SOS_STORE = [s for s in SOS_STORE if s["id"] != sos_id and s.get("sos_id") != sos_id]
    return {"message": "SOS request deleted", "sos": existing}

