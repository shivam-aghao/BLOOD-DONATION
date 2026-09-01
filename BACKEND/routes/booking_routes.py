from fastapi import APIRouter, HTTPException

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


# =========================
# CREATE BOOKING
# =========================
@router.post("/")
def create_booking_request(
    booking: BookingRequest
):
    return create_booking(
        booking.model_dump()
    )


# =========================
# GET ALL BOOKINGS
# =========================
@router.get("/")
def get_all_booking_requests():
    return get_all_bookings()


# =========================
# GET SINGLE BOOKING
# =========================
@router.get("/{booking_id}")
def get_booking_request(
    booking_id: int
):
    try:
        return get_booking(booking_id)

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


# =========================
# UPDATE BOOKING STATUS
# =========================
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