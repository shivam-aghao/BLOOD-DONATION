from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from routes.hospital_routes import DEFAULT_HOSPITALS

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)

BOOKINGS_STORE = []

class BookingCreate(BaseModel):
    hospital_id: str
    patient_name: str
    blood_group: str
    units: int
    doctor: Optional[str] = None
    contact: str
    notes: Optional[str] = None

@router.post("/")
def create_booking(b: BookingCreate):
    booking_id = f"BK-{len(BOOKINGS_STORE) + 101}"
    hosp = next((h for h in DEFAULT_HOSPITALS if h["hospital_id"] == b.hospital_id or h.get("id") == b.hospital_id), None)
    hospital_name = hosp["hospital_name"] if hosp else "Partner Hospital"

    new_booking = {
        "id": booking_id,
        "hospital_id": b.hospital_id,
        "hospital_name": hospital_name,
        "patient_name": b.patient_name,
        "blood_group": b.blood_group,
        "units": b.units,
        "doctor": b.doctor or "Attending Physician",
        "contact": b.contact,
        "notes": b.notes,
        "status": "pending"
    }
    BOOKINGS_STORE.insert(0, new_booking)
    return {"message": "Booking request submitted successfully", "booking": new_booking}

@router.get("/")
def list_bookings(hospital_id: Optional[str] = None):
    if hospital_id:
        return [b for b in BOOKINGS_STORE if b["hospital_id"] == hospital_id]
    return BOOKINGS_STORE

@router.post("/{booking_id}/fulfill")
def fulfill_booking(booking_id: str):
    b = next((item for item in BOOKINGS_STORE if item["id"] == booking_id), None)
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    b["status"] = "fulfilled"
    # Deduct units from hospital inventory
    hosp = next((h for h in DEFAULT_HOSPITALS if h["hospital_id"] == b["hospital_id"] or h.get("id") == b["hospital_id"]), None)
    if hosp and "inventory" in hosp:
        group = b["blood_group"]
        current = hosp["inventory"].get(group, 0)
        hosp["inventory"][group] = max(0, current - b["units"])

    return {"message": "Booking fulfilled and stock updated", "booking": b}

