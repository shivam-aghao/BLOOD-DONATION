# Booking Service
# Handles blood booking business logic


def create_booking(booking):
    """Create a new blood booking request."""
    booking["status"] = "Pending"
    return booking


def get_booking(booking_id):
    """Get booking details using booking ID."""
    return {"booking_id": booking_id}


def update_booking_status(booking, status):
    """Update booking status."""

    allowed_status = ["Pending", "Approved", "Rejected", "Fulfilled"]

    if status not in allowed_status:
        raise ValueError("Invalid booking status")

    booking["status"] = status
    return booking


def check_available_units(available_units, requested_units):
    """Check whether requested blood units are available."""

    if requested_units <= 0:
        return False

    return available_units >= requested_units
    