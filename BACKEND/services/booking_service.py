# Store all bookings temporarily
bookings = []


# =========================
# CREATE BOOKING
# =========================
def create_booking(data: dict):

    new_id = len(bookings) + 1

    booking = {
        "booking_id": new_id,
        "hospital_id": data["hospital_id"],
        "blood_group": data["blood_group"],
        "patient_name": data["patient_name"],
        "units": data["units"],
        "doctor_name": data.get("doctor_name"),
        "contact": data["contact"],
        "notes": data.get("notes"),
        "status": "pending"
    }

    bookings.append(booking)

    return booking


# =========================
# GET SINGLE BOOKING
# =========================
def get_booking(booking_id: int):

    for booking in bookings:

        if booking["booking_id"] == booking_id:
            return booking

    raise ValueError("Booking not found")


# =========================
# GET ALL BOOKINGS
# =========================
def get_all_bookings():

    return bookings


# =========================
# UPDATE BOOKING STATUS
# =========================
def update_booking_status(
    booking: dict,
    status: str
):

    allowed_statuses = [
        "pending",
        "approved",
        "fulfilled",
        "cancelled"
    ]

    if status not in allowed_statuses:
        raise ValueError(
            "Invalid booking status. "
            "Use: pending, approved, fulfilled or cancelled"
        )

    booking_data = get_booking(
        booking["booking_id"]
    )

    booking_data["status"] = status

    return booking_data