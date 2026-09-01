from fastapi import APIRouter, HTTPException 
from typing import Optional

from schemas.booking_schema import ( 
    BookingRequest, 
    BookingStatusUpdate 
) 

from services.booking_service import ( 
    create_booking, 
    get_booking, 
    get_all_bookings,
    update_booking_status 
) 

router = APIRouter( 
    prefix="/bookings", 
    tags=["Bookings"] 
) 


@router.get("/")
def list_bookings(hospital_id: Optional[str] = None):
    all_b = get_all_bookings()
    if hospital_id:
        return [b for b in all_b if str(b.get("hospital_id")) == str(hospital_id)]
    return all_b


@router.post("/") 
def create_booking_request(booking: BookingRequest): 
    return create_booking(booking.model_dump()) 


@router.get("/{booking_id}") 
def get_booking_request(booking_id: int): 
    try:
        return get_booking(booking_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.put("/{booking_id}/status") 
def change_booking_status( 
    booking_id: int, 
    data: BookingStatusUpdate 
): 
    booking = { 
        "booking_id": booking_id 
    } 

    try: 
        return update_booking_status( 
            booking, 
            data.status 
        ) 
    except ValueError as error: 
        raise HTTPException( 
            status_code=400, 
            detail=str(error) 
        ) 
