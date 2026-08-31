# SOS Service
# Handles emergency blood request logic


def create_sos_request(request):
    """Create a new SOS request."""
    return request


def get_sos_request(request_id):
    """Get SOS request by ID."""
    return {"request_id": request_id}


def find_matching_blood_groups(blood_group):
    """Find compatible blood groups for an SOS request."""

    compatibility = {
        "O-": ["O-"],
        "O+": ["O-", "O+"],
        "A-": ["O-", "A-"],
        "A+": ["O-", "O+", "A-", "A+"],
        "B-": ["O-", "B-"],
        "B+": ["O-", "O+", "B-", "B+"],
        "AB-": ["O-", "A-", "B-", "AB-"],
        "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
    }

    return compatibility.get(blood_group, [])


def update_sos_status(request, status):
    """Update SOS request status."""

    request["status"] = status
    return request